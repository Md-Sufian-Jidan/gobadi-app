import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { DataSource, Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { Referral, PayoutStatus } from './referral.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';
export { Referral } from './referral.entity';

const REFERRAL_REWARD_AMOUNT = 100;

@Injectable()
export class ReferralsService {
  constructor(
    @InjectRepository(Referral)
    private readonly referralRepository: Repository<Referral>,
    private readonly dataSource: DataSource,
    @InjectQueue('referrals-queue')
    private readonly referralsQueue: Queue,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getOrCreateForUser(userId: number): Promise<Referral> {
    let referral = await this.referralRepository.findOneBy({ userId });
    if (referral) {
      return referral;
    }
    referral = this.referralRepository.create({
      userId,
      referralCode: await this.generateUniqueCode(),
    });
    return this.referralRepository.save(referral);
  }

  async claim(userId: number, code: string): Promise<Referral> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Referral);

      let claimant = await repo
        .createQueryBuilder('r')
        .setLock('pessimistic_write')
        .where('r.userId = :userId', { userId })
        .getOne();
      if (!claimant) {
        claimant = await repo.save(
          repo.create({
            userId,
            referralCode: await this.generateUniqueCode(),
          }),
        );
      }
      if (claimant.redeemedReferralCode) {
        throw new ConflictException('You have already claimed a referral code');
      }
      if (claimant.referralCode === code) {
        throw new BadRequestException(
          'You cannot claim your own referral code',
        );
      }

      const referrer = await repo
        .createQueryBuilder('r')
        .setLock('pessimistic_write')
        .where('r.referralCode = :code', { code })
        .getOne();
      if (!referrer) {
        throw new NotFoundException('Referral code not found');
      }
      if (referrer.userId === userId) {
        throw new BadRequestException(
          'You cannot claim your own referral code',
        );
      }

      referrer.referralCount += 1;
      referrer.pendingAmount += REFERRAL_REWARD_AMOUNT;
      referrer.payoutStatus = PayoutStatus.PENDING;
      await repo.save(referrer);

      claimant.redeemedReferralCode = code;
      const savedClaimant = await repo.save(claimant);

      try {
        await this.referralsQueue.add('referral-claimed', {
          referrerUserId: referrer.userId,
          claimantUserId: userId,
          code,
          amount: REFERRAL_REWARD_AMOUNT,
        });
      } catch (err) {
        console.warn('Failed to enqueue referral-claimed job', err);
      }

      return savedClaimant;
    });
  }

  async findPending(): Promise<Referral[]> {
    return this.referralRepository.find({
      where: { payoutStatus: PayoutStatus.PENDING },
      order: { id: 'ASC' },
    });
  }

  async approvePayout(id: number, amount: number): Promise<Referral> {
    const referral = await this.referralRepository.findOneBy({ id });
    if (!referral) {
      throw new NotFoundException('Referral not found');
    }
    const payoutAmount = Math.min(amount, referral.pendingAmount);
    referral.pendingAmount -= payoutAmount;
    referral.totalEarned += payoutAmount;
    referral.payoutStatus =
      referral.pendingAmount > 0 ? PayoutStatus.PENDING : PayoutStatus.PAID;
    const saved = await this.referralRepository.save(referral);

    await this.notificationsService.createNotification(
      saved.userId,
      'Referral payout approved',
      `Your referral payout of ৳${payoutAmount} was approved.`,
      NotificationType.REFERRAL,
    );

    return saved;
  }

  private async generateUniqueCode(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = `FARM-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const existing = await this.referralRepository.findOneBy({
        referralCode: candidate,
      });
      if (!existing) {
        return candidate;
      }
    }
    throw new Error('Failed to generate a unique referral code');
  }
}
