import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AlertsModule } from '../alerts/alerts.module';
import { OrdersModule } from '../orders/orders.module';
import { ReferralsModule } from '../referrals/referrals.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdminUsersController } from './admin-users.controller';
import { AdminAlertsController } from './admin-alerts.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminReferralsController } from './admin-referrals.controller';
import { AdminNotificationsController } from './admin-notifications.controller';

@Module({
  imports: [UsersModule, AlertsModule, OrdersModule, ReferralsModule, NotificationsModule],
  controllers: [
    AdminUsersController,
    AdminAlertsController,
    AdminOrdersController,
    AdminReferralsController,
    AdminNotificationsController,
  ],
})
export class AdminModule {}
