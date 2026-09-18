import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AlertsModule } from '../alerts/alerts.module';
import { OrdersModule } from '../orders/orders.module';
import { ReferralsModule } from '../referrals/referrals.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { FaqsModule } from '../faqs/faqs.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { MarketRatesModule } from '../market-rates/market-rates.module';
import { SupportModule } from '../support/support.module';
import { RedisModule } from '../redis/redis.module';
import { MailModule } from '../mail/mail.module';
import { getRequiredJwtSecret } from '../auth/jwt-secret.util';

// Entities
import { Admin } from './entities/admin.entity';
import { AdminRefreshToken } from './entities/admin-refresh-token.entity';

// Auth
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthController } from './admin-auth.controller';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';
import { AdminRolesGuard } from './guards/admin-roles.guard';

// CRUD
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

// Existing admin controllers (manage other entities)
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
    TypeOrmModule.forFeature([Admin, AdminRefreshToken]),
    JwtModule.register({
      secret: getRequiredJwtSecret(),
      signOptions: { expiresIn: '15m' },
    }),
    RedisModule,
    MailModule,
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
    AdminAuthController,
    AdminController,
    AdminUsersController,
    AdminAlertsController,
    AdminOrdersController,
    AdminReferralsController,
    AdminNotificationsController,
    AdminFaqsController,
    AdminSupportController,
    AdminMarketRatesController,
  ],
  providers: [
    AdminAuthService,
    AdminService,
    AdminJwtAuthGuard,
    AdminRolesGuard,
  ],
  exports: [AdminAuthService, AdminService, AdminJwtAuthGuard, AdminRolesGuard],
})
export class AdminModule {}
