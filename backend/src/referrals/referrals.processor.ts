import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('referrals-queue')
export class ReferralsProcessor extends WorkerHost {
  private readonly logger = new Logger(ReferralsProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name !== 'referral-claimed') {
      return;
    }
    const { referrerUserId, claimantUserId, code, amount } = job.data;
    this.logger.log(
      `Referral ${code} claimed by user ${claimantUserId}, crediting user ${referrerUserId} with ${amount}`,
    );
    return { success: true };
  }
}
