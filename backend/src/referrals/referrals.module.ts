import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Referral } from './referral.entity';
import { ReferralsController } from './referrals.controller';
import { ReferralsService } from './referrals.service';
import { ReferralsProcessor } from './referrals.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Referral]),
    BullModule.registerQueue({ name: 'referrals-queue' }),
  ],
  controllers: [ReferralsController],
  providers: [ReferralsService, ReferralsProcessor],
  exports: [ReferralsService],
})
export class ReferralsModule {}
