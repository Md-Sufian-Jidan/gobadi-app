import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MarketItem } from './market-item.entity';
import { Order } from './order.entity';
import { RedisService } from '../redis/redis.service';
export { MarketItem } from './market-item.entity';
export { Order } from './order.entity';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectRepository(MarketItem)
    private readonly marketItemRepository: Repository<MarketItem>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectQueue('order-queue')
    private readonly orderQueue: Queue,
    @InjectQueue('mail-queue')
    private readonly mailQueue: Queue,
    private readonly redisService: RedisService,
  ) {}

  async getCatalog(): Promise<MarketItem[]> {
    try {
      const cached = await this.redisService.get('cache:marketplace:catalog');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.warn('Failed to read catalog cache from Redis', err);
    }

    const catalog = await this.marketItemRepository.find({
      order: { id: 'ASC' },
    });

    try {
      await this.redisService.set(
        'cache:marketplace:catalog',
        JSON.stringify(catalog),
        300,
      );
    } catch (err) {
      console.warn('Failed to write catalog cache to Redis', err);
    }

    return catalog;
  }

  async getCatalogItemById(id: string): Promise<MarketItem> {
    const item = await this.marketItemRepository.findOneBy({
      id: parseInt(id, 10),
    });
    if (!item) {
      throw new BadRequestException('Item not found');
    }
    return item;
  }

  async checkoutOrder(data: {
    items: Array<{ itemId: string; quantity: number }>;
    deliveryAddress: string;
  }): Promise<Order> {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('No items in order');
    }

    let totalPrice = 0;
    for (const itemRef of data.items) {
      const dbItem = await this.getCatalogItemById(itemRef.itemId);
      totalPrice += dbItem.price * itemRef.quantity;
    }

    const orderId = `GBD-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = this.orderRepository.create({
      id: orderId,
      items: data.items,
      totalPrice,
      deliveryAddress: data.deliveryAddress,
      status: 'Placed',
    });

    const savedOrder = await this.orderRepository.save(newOrder);

    // Push task to background queue via BullMQ
    try {
      await this.orderQueue.add('process-checkout', {
        orderId: savedOrder.id,
        totalPrice: savedOrder.totalPrice,
        deliveryAddress: savedOrder.deliveryAddress,
        items: savedOrder.items,
      });
    } catch (err) {
      console.warn('Failed to push order job to BullMQ queue', err);
    }

    return savedOrder;
  }

  async verifyPayment(orderId: string, transactionId: string): Promise<Order> {
    if (!orderId || !transactionId) {
      throw new BadRequestException('Order ID and Transaction ID are required');
    }

    const order = await this.orderRepository.findOneBy({ id: orderId });
    if (!order) {
      throw new BadRequestException('Order not found');
    }

    order.status = 'Paid';
    order.paymentStatus = 'Verified';
    order.transactionId = transactionId;

    const savedOrder = await this.orderRepository.save(order);

    // Queue payment confirmation email asynchronously via BullMQ
    try {
      await this.mailQueue.add('send-payment-confirmation', {
        email: 'user@gobadi.com',
        orderId: savedOrder.id,
        totalPrice: savedOrder.totalPrice,
        transactionId,
      });
    } catch (err) {
      console.warn('Failed to queue payment confirmation email job', err);
    }

    return savedOrder;
  }

  async getOrders(): Promise<Order[]> {
    return this.orderRepository.find({ order: { id: 'DESC' } });
  }
}
