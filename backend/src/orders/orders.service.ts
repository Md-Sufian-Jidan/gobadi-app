import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CartService } from '../cart/cart.service';
import { AddressesService } from '../addresses/addresses.service';
import { ProductsService } from '../products/products.service';
import { LivestockService } from '../livestock/livestock.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PaginatedResult } from '../common/paginated-result.interface';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly cartService: CartService,
    private readonly addressesService: AddressesService,
    private readonly productsService: ProductsService,
    private readonly livestockService: LivestockService,
    private readonly dataSource: DataSource,
    @InjectQueue('order-queue')
    private readonly orderQueue: Queue,
  ) {}

  async placeOrder(userId: number, dto: CreateOrderDto): Promise<Order> {
    const cart = await this.cartService.getCart(userId);
    if (cart.items.length === 0) {
      throw new BadRequestException('Cannot place an order with an empty cart');
    }

    // Validate all items are available
    for (const item of cart.items) {
      if (!item.isAvailable) {
        throw new BadRequestException(
          `Item ${item.name} is not available: ${item.warning}`,
        );
      }
    }

    const address = await this.addressesService.findOne(dto.addressId, userId);

    const orderId = `GBD-${Math.floor(100000 + Math.random() * 900000)}`;

    return this.dataSource.transaction(async (manager) => {
      // 1. Reserve stock in ledger for products and reserve livestock
      for (const item of cart.items) {
        if (item.productId) {
          // Reserve via ProductsService using transaction manager to be transaction-safe:
          await this.productsService.reserveStock(
            item.productId,
            item.quantity,
            orderId,
            manager,
          );
        } else if (item.livestockId) {
          await this.livestockService.reserveListing(
            item.livestockId,
            true,
            manager,
          );
        }
      }

      // 2. Create the order
      const order = this.orderRepository.create({
        id: orderId,
        userId,
        totalPrice: cart.subtotal,
        tax: cart.tax,
        shippingFee: cart.shipping,
        netAmount: cart.total,
        deliveryAddress: {
          label: address.label,
          contactName: address.contactName,
          phone: address.phone,
          division: address.division,
          district: address.district,
          upazila: address.upazila,
          postalCode: address.postalCode,
          latitude: address.latitude,
          longitude: address.longitude,
        },
        deliveryMethod: dto.deliveryMethod,
        deliveryNotes: dto.deliveryNotes,
        status: OrderStatus.PENDING,
        paymentStatus: 'pending',
      });

      const savedOrder = await manager.save(Order, order);

      // 3. Create order items
      const orderItems = cart.items.map((item) => {
        return this.orderItemRepository.create({
          orderId,
          productId: item.productId || null,
          livestockId: item.livestockId || null,
          quantity: item.quantity,
          price: item.unitPrice,
          discount: item.unitPrice - item.discountPrice,
          name: item.name,
        });
      });

      await manager.save(OrderItem, orderItems);

      // 4. Clear cart
      await this.cartService.clearCart(userId);

      // 5. Add BullMQ job for background processing
      try {
        await this.orderQueue.add('process-checkout', {
          orderId: savedOrder.id,
          totalPrice: savedOrder.totalPrice,
          deliveryAddress: savedOrder.deliveryAddress,
          items: orderItems.map((oi) => ({
            name: oi.name,
            quantity: oi.quantity,
          })),
        });
      } catch (err) {
        console.warn('Failed to queue checkout background job', err);
      }

      return savedOrder;
    });
  }

  async getMyOrders(userId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderDetails(id: string, userId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { items: true },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.userId !== userId) {
      throw new ForbiddenException('You do not own this order');
    }
    return order;
  }

  async getOrders(
    page?: number,
    limit?: number,
    status?: OrderStatus,
  ): Promise<Order[] | PaginatedResult<Order>> {
    const where: any = status ? { status } : {};
    if (!page && !limit) {
      return this.orderRepository.find({
        where,
        relations: { items: true },
        order: { createdAt: 'DESC' },
      });
    }

    const currentPage = page && page > 0 ? page : 1;
    const pageSize = limit && limit > 0 ? limit : 20;

    const [data, total] = await this.orderRepository.findAndCount({
      where,
      relations: { items: true },
      order: { createdAt: 'DESC' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });

    return { data, page: currentPage, limit: pageSize, total };
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const order = await orderRepo.findOne({
        where: { id },
        relations: { items: true },
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Implement ledger commit/release on state transition
      if (
        status === OrderStatus.COMPLETED &&
        order.status !== OrderStatus.COMPLETED
      ) {
        // Commit stock in inventory ledger for products, mark livestock as sold
        for (const item of order.items) {
          if (item.productId) {
            await this.productsService.commitStock(
              item.productId,
              item.quantity,
              order.id,
              manager,
            );
          } else if (item.livestockId) {
            await this.livestockService.markSold(
              item.livestockId,
              true,
              manager,
            );
          }
        }
      } else if (
        status === OrderStatus.CANCELLED &&
        order.status !== OrderStatus.CANCELLED
      ) {
        // Release stock in inventory ledger, release livestock reservation
        for (const item of order.items) {
          if (item.productId) {
            await this.productsService.releaseStock(
              item.productId,
              item.quantity,
              order.id,
              manager,
            );
          } else if (item.livestockId) {
            await this.livestockService.reserveListing(
              item.livestockId,
              false,
              manager,
            );
          }
        }
      }

      order.status = status;
      return orderRepo.save(order);
    });
  }
}
