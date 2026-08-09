import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

@Processor('referrals-queue')
export class ReferralsProcessor extends WorkerHost {
  private readonly logger = new Logger(ReferralsProcessor.name);

  constructor(private readonly notificationsService: NotificationsService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name !== 'referral-claimed') {
      return;
    }
    const { referrerUserId, claimantUserId, code, amount } = job.data;
    this.logger.log(
      `Referral ${code} claimed by user ${claimantUserId}, crediting user ${referrerUserId} with ${amount}`,
    );
    await this.notificationsService.createNotification(
      referrerUserId,
      'Referral reward earned',
      `Someone used your referral code — you earned ৳${amount}.`,
      NotificationType.REFERRAL,
    );
    return { success: true };
  }
}
