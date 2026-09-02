import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from './subscription-plan.entity';
import { UserSubscription, SubscriptionStatus } from './user-subscription.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepository: Repository<SubscriptionPlan>,
    @InjectRepository(UserSubscription)
    private readonly subscriptionRepository: Repository<UserSubscription>,
  ) {}

  async listPlans(): Promise<SubscriptionPlan[]> {
    return this.planRepository.find({ where: { isActive: true } });
  }

  async getMySubscription(userId: number): Promise<UserSubscription | null> {
    return this.subscriptionRepository.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  async subscribe(
    userId: number,
    planId: number,
  ): Promise<UserSubscription> {
    // Check if user already has an active subscription
    const existing = await this.getMySubscription(userId);
    if (existing) {
      throw new BadRequestException('You already have an active subscription');
    }

    const plan = await this.planRepository.findOneBy({ id: planId });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    return this.subscriptionRepository.save(
      this.subscriptionRepository.create({
        userId,
        planId,
        startDate,
        endDate,
        status: SubscriptionStatus.ACTIVE,
      }),
    );
  }

  async cancel(userId: number): Promise<UserSubscription> {
    const subscription = await this.getMySubscription(userId);
    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    return this.subscriptionRepository.save(subscription);
  }

  async listAll(): Promise<UserSubscription[]> {
    return this.subscriptionRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}
