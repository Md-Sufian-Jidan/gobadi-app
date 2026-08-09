import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Referral } from './referral.entity';
import { ReferralsController } from './referrals.controller';
import { ReferralsService } from './referrals.service';
import { ReferralsProcessor } from './referrals.processor';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Referral]),
    BullModule.registerQueue({ name: 'referrals-queue' }),
    NotificationsModule,
  ],
  controllers: [ReferralsController],
  providers: [ReferralsService, ReferralsProcessor],
  exports: [ReferralsService],
})
export class ReferralsModule {}
