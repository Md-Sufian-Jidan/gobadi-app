import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceController } from './marketplace.controller';
import { MarketItem } from './market-item.entity';
import { Order } from './order.entity';
import { OrderProcessor } from './order.processor';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarketItem, Order]),
    BullModule.registerQueue({
      name: 'order-queue',
    }),
    UsersModule,
  ],
  controllers: [MarketplaceController],
  providers: [MarketplaceService, OrderProcessor],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
