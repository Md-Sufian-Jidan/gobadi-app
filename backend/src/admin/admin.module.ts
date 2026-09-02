import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AlertsModule } from '../alerts/alerts.module';
import { OrdersModule } from '../orders/orders.module';
import { ReferralsModule } from '../referrals/referrals.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { FaqsModule } from '../faqs/faqs.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { MarketRatesModule } from '../market-rates/market-rates.module';
import { SupportModule } from '../support/support.module';
import { AdminUsersController } from './admin-users.controller';
import { AdminAlertsController } from './admin-alerts.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminReferralsController } from './admin-referrals.controller';
import { AdminNotificationsController } from './admin-notifications.controller';
import { AdminFaqsController } from '../faqs/admin-faqs.controller';
import { AdminSupportController } from '../support/admin-support.controller';
import { AdminMarketRatesController } from '../market-rates/admin-market-rates.controller';

@Module({
  imports: [
    UsersModule,
    AlertsModule,
    OrdersModule,
    ReferralsModule,
    NotificationsModule,
    FaqsModule,
    SubscriptionsModule,
    MarketRatesModule,
    SupportModule,
  ],
  controllers: [
    AdminUsersController,
    AdminAlertsController,
    AdminOrdersController,
    AdminReferralsController,
    AdminNotificationsController,
    AdminFaqsController,
    AdminSupportController,
    AdminMarketRatesController,
  ],
})
export class AdminModule {}
