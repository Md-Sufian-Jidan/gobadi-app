import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery, DeliveryStatus } from './delivery.entity';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { Order, OrderStatus } from '../orders/order.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createDelivery(orderId: string, courierName: string): Promise<Delivery> {
    const existing = await this.deliveryRepository.findOneBy({ orderId });
    if (existing) {
      return existing;
    }

    const trackingNumber = `GBD-TRK-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const delivery = this.deliveryRepository.create({
      orderId,
      trackingNumber,
      courierName,
      status: DeliveryStatus.PENDING,
      timeline: [
        {
          status: DeliveryStatus.PENDING,
          timestamp: new Date(),
          description: 'Shipment info received by courier',
        },
      ],
    });

    const saved = await this.deliveryRepository.save(delivery);

    // Update tracking number in Order
    await this.orderRepository.update(orderId, { trackingNumber });

    return saved;
  }

  async updateDelivery(orderId: string, dto: UpdateDeliveryDto): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOneBy({ orderId });
    if (!delivery) {
      throw new NotFoundException('Delivery details not found for this order');
    }

    delivery.status = dto.status;
    if (dto.deliveryProofUrl) delivery.deliveryProofUrl = dto.deliveryProofUrl;
    if (dto.deliveryNotes) delivery.deliveryNotes = dto.deliveryNotes;

    delivery.timeline.push({
      status: dto.status,
      timestamp: new Date(),
      location: dto.location,
      description: dto.description || `Delivery status changed to ${dto.status}`,
    });

    const saved = await this.deliveryRepository.save(delivery);

    // Auto-update order status based on delivery updates
    let targetOrderStatus: OrderStatus | undefined;
    if (dto.status === DeliveryStatus.DELIVERED) {
      targetOrderStatus = OrderStatus.DELIVERED;
    } else if (dto.status === DeliveryStatus.PICKED_UP) {
      targetOrderStatus = OrderStatus.SHIPPED;
    } else if (dto.status === DeliveryStatus.IN_TRANSIT) {
      targetOrderStatus = OrderStatus.SHIPPED;
    } else if (dto.status === DeliveryStatus.OUT_FOR_DELIVERY) {
      targetOrderStatus = OrderStatus.SHIPPED;
    } else if (dto.status === DeliveryStatus.FAILED) {
      targetOrderStatus = OrderStatus.FAILED;
    } else if (dto.status === DeliveryStatus.RETURNED) {
      targetOrderStatus = OrderStatus.RETURNED;
    }

    if (targetOrderStatus) {
      await this.orderRepository.update(orderId, { status: targetOrderStatus });
    }

    const order = await this.orderRepository.findOneBy({ id: orderId });
    if (order) {
      await this.notificationsService.createNotification(
        order.userId,
        'Delivery update',
        `Your order is now ${dto.status} (tracking: ${delivery.trackingNumber}).`,
        NotificationType.DELIVERY,
        'Order',
        order.id,
      );
    }

    return saved;
  }

  async getDeliveryByOrderId(orderId: string): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOne({
      where: { orderId },
      relations: { order: true },
    });
    if (!delivery) {
      throw new NotFoundException('Delivery details not found');
    }
    return delivery;
  }

  async getDeliveryByTrackingNumber(trackingNumber: string): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOne({
      where: { trackingNumber },
      relations: { order: true },
    });
    if (!delivery) {
      throw new NotFoundException('Delivery details not found for tracking number');
    }
    return delivery;
  }
}
