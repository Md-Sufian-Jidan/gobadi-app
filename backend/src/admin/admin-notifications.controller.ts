import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationsService } from '../notifications/notifications.service';
import { Notification, NotificationType } from '../notifications/notification.entity';
import { SendNotificationDto } from '../notifications/dto/send-notification.dto';
import { BroadcastNotificationDto } from '../notifications/dto/broadcast-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { PaginatedResult } from '../common/paginated-result.interface';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List sent notifications (admin only)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'type', required: false, enum: NotificationType })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({ status: 200, description: 'Paginated list of notifications' })
  async getNotifications(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: NotificationType,
    @Query('userId') userId?: string,
  ): Promise<PaginatedResult<Notification>> {
    return this.notificationsService.findAllPaginated(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      type,
      userId ? parseInt(userId, 10) : undefined,
    );
  }

  @Post('send')
  @ApiOperation({ summary: 'Send a notification to specific users (admin only)' })
  @ApiResponse({ status: 201, description: 'Notifications created and queued for push' })
  async send(@Body() dto: SendNotificationDto): Promise<{ count: number }> {
    return this.notificationsService.sendToUsers(
      dto.userIds,
      dto.title,
      dto.body,
      dto.type,
      dto.referenceType,
      dto.referenceId,
    );
  }

  @Post('broadcast')
  @ApiOperation({
    summary: 'Broadcast a notification to all users, or all users of a role (admin only)',
  })
  @ApiResponse({ status: 201, description: 'Broadcast queued' })
  async broadcast(@Body() dto: BroadcastNotificationDto): Promise<{ queued: boolean }> {
    return this.notificationsService.broadcastToRole(dto.title, dto.body, dto.type, dto.role);
  }
}
