import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from './delivery.entity';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { Order } from '../orders/order.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Delivery, Order]), NotificationsModule],
  providers: [DeliveryService],
  controllers: [DeliveryController],
  exports: [DeliveryService, TypeOrmModule],
})
export class DeliveryModule {}
