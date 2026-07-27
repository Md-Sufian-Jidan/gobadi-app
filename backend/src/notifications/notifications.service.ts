import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectQueue('mail-queue')
    private readonly mailQueue: Queue,
  ) {}

  async createNotification(
    userId: number,
    title: string,
    body: string,
    type: NotificationType,
    referenceType?: string,
    referenceId?: string,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      title,
      body,
      type,
      referenceType,
      referenceId,
      isRead: false,
    });

    const saved = await this.notificationRepository.save(notification);

    // Queue asynchronous background tasks (like push notifications, SMS alerts, or email receipts)
    try {
      await this.mailQueue.add('send-notification-alert', {
        userId,
        notificationId: saved.id,
        title: saved.title,
        body: saved.body,
        type: saved.type,
      });
    } catch (err) {
      console.warn('Failed to push notification email job to queue', err);
    }

    return saved;
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: number, userId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOneBy({ id });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException('You do not own this notification');
    }

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update({ userId, isRead: false }, { isRead: true });
  }
}
