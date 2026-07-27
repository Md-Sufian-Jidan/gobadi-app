import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Alert } from './alert.entity';
import { AlertActionLog } from './alert-action-log.entity';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { AlertsProcessor } from './alerts.processor';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alert, AlertActionLog]),
    BullModule.registerQueue({ name: 'alerts-queue' }),
    ChatModule,
  ],
  controllers: [AlertsController],
  providers: [AlertsService, AlertsProcessor],
  exports: [AlertsService],
})
export class AlertsModule {}
