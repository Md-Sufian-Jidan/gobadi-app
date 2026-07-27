import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MarketItem } from './market-item.entity';
import { Order } from './order.entity';
import { RedisService } from '../redis/redis.service';
import { PaginatedResult } from '../common/paginated-result.interface';
import { UsersService } from '../users/users.service';
import { MeilisearchService } from '../meilisearch/meilisearch.service';
export { MarketItem } from './market-item.entity';
export { Order } from './order.entity';

const MARKETPLACE_INDEX = 'marketplace';

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
    private readonly usersService: UsersService,
    private readonly meilisearchService: MeilisearchService,
  ) {}

  async getCatalog(
    page?: number,
    limit?: number,
    category?: string,
  ): Promise<MarketItem[] | PaginatedResult<MarketItem>> {
    let catalog: MarketItem[] | null;
    try {
      const cached = await this.redisService.get('cache:marketplace:catalog');
      catalog = cached ? JSON.parse(cached) : null;
    } catch (err) {
      console.warn('Failed to read catalog cache from Redis', err);
      catalog = null;
    }

    if (!catalog) {
      catalog = await this.marketItemRepository.find({
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
    }

    if (category) {
      catalog = catalog.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase(),
      );
    }

    if (!page && !limit) {
      return catalog;
    }
    const currentPage = page && page > 0 ? page : 1;
    const pageSize = limit && limit > 0 ? limit : 20;
    const start = (currentPage - 1) * pageSize;
    return {
      data: catalog.slice(start, start + pageSize),
      page: currentPage,
      limit: pageSize,
      total: catalog.length,
    };
  }

  async search(q: string, category?: string): Promise<MarketItem[]> {
    if (!q) {
      return [];
    }
    const hits = await this.meilisearchService.search<MarketItem>(
      MARKETPLACE_INDEX,
      q,
      { limit: 10, filter: category ? `category = "${category}"` : undefined },
    );
    if (hits !== null) {
      return hits;
    }
    return this.marketItemRepository.find({
      where: [
        { name: ILike(`%${q}%`), ...(category ? { category } : {}) },
        { category: ILike(`%${q}%`) },
      ],
      take: 10,
    });
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

  async getMyListings(sellerId: number): Promise<MarketItem[]> {
    return this.marketItemRepository.find({
      where: { sellerId },
      order: { id: 'DESC' },
    });
  }

  async createListing(
    sellerId: number,
    data: { name: string; price: number; category: string; image?: string },
  ): Promise<MarketItem> {
    const newItem = this.marketItemRepository.create({ ...data, sellerId });
    const saved = await this.marketItemRepository.save(newItem);

    try {
      await this.redisService.del('cache:marketplace:catalog');
    } catch (err) {
      console.warn('Failed to invalidate marketplace catalog cache', err);
    }
    await this.meilisearchService.indexDocument(MARKETPLACE_INDEX, {
      ...saved,
    });

    return saved;
  }

  async checkoutOrder(
    userId: number,
    data: {
      items: Array<{ itemId: string; quantity: number }>;
      deliveryAddress: string;
    },
  ): Promise<Order> {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('No items in order');
    }

    const itemIds = data.items.map((itemRef) => parseInt(itemRef.itemId, 10));
    const dbItems = await this.marketItemRepository.findBy({ id: In(itemIds) });
    const dbItemsById = new Map(dbItems.map((item) => [item.id, item]));

    let totalPrice = 0;
    for (const itemRef of data.items) {
      const dbItem = dbItemsById.get(parseInt(itemRef.itemId, 10));
      if (!dbItem) {
        throw new BadRequestException(`Item not found: ${itemRef.itemId}`);
      }
      totalPrice += dbItem.price * itemRef.quantity;
    }

    const orderId = `GBD-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = this.orderRepository.create({
      id: orderId,
      userId,
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
      const buyer = order.userId
        ? await this.usersService.findById(order.userId)
        : null;
      if (buyer?.email) {
        await this.mailQueue.add('send-payment-confirmation', {
          email: buyer.email,
          orderId: savedOrder.id,
          totalPrice: savedOrder.totalPrice,
          transactionId,
        });
      }
    } catch (err) {
      console.warn('Failed to queue payment confirmation email job', err);
    }

    return savedOrder;
  }

  async getMyOrders(userId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getOrders(
    page?: number,
    limit?: number,
    status?: string,
  ): Promise<Order[] | PaginatedResult<Order>> {
    const where = status ? { status } : {};
    if (!page && !limit) {
      return this.orderRepository.find({ where, order: { id: 'DESC' } });
    }
    const currentPage = page && page > 0 ? page : 1;
    const pageSize = limit && limit > 0 ? limit : 20;
    const [data, total] = await this.orderRepository.findAndCount({
      where,
      order: { id: 'DESC' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });
    return { data, page: currentPage, limit: pageSize, total };
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    order.status = status;
    return this.orderRepository.save(order);
  }
}
