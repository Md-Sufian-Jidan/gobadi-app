import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { SubscriptionPlan } from './subscription-plan.entity';
import { UserSubscription } from './user-subscription.entity';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List available subscription plans' })
  async listPlans(): Promise<SubscriptionPlan[]> {
    return this.subscriptionsService.listPlans();
  }

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get user's current subscription" })
  async getMySubscription(
    @CurrentUser() user: JwtPayload,
  ): Promise<UserSubscription | null> {
    return this.subscriptionsService.getMySubscription(user.sub);
  }

  @Post('subscribe')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Subscribe to a plan' })
  @ApiResponse({ status: 201, description: 'Subscription created' })
  async subscribe(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubscribeDto,
  ): Promise<UserSubscription> {
    return this.subscriptionsService.subscribe(user.sub, dto.planId);
  }

  @Post('cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel subscription' })
  async cancel(
    @CurrentUser() user: JwtPayload,
  ): Promise<UserSubscription> {
    return this.subscriptionsService.cancel(user.sub);
  }

  @Get('admin/all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all subscriptions (admin)' })
  async listAll(): Promise<UserSubscription[]> {
    return this.subscriptionsService.listAll();
  }
}
