import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AlertsModule } from '../alerts/alerts.module';
import { OrdersModule } from '../orders/orders.module';
import { ReferralsModule } from '../referrals/referrals.module';
import { AdminUsersController } from './admin-users.controller';
import { AdminAlertsController } from './admin-alerts.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminReferralsController } from './admin-referrals.controller';

@Module({
  imports: [UsersModule, AlertsModule, OrdersModule, ReferralsModule],
  controllers: [
    AdminUsersController,
    AdminAlertsController,
    AdminOrdersController,
    AdminReferralsController,
  ],
})
export class AdminModule {}
