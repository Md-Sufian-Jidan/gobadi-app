import { Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { Notification } from './notification.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "Get currently logged-in user's notifications" })
  @ApiResponse({ status: 200, description: 'List of notifications' })
  async getUserNotifications(
    @CurrentUser() user: JwtPayload,
  ): Promise<Notification[]> {
    return this.notificationsService.getUserNotifications(user.sub);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', example: '1' })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<Notification> {
    return this.notificationsService.markAsRead(parseInt(id, 10), user.sub);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all user notifications as read' })
  async markAllAsRead(@CurrentUser() user: JwtPayload): Promise<{ success: boolean }> {
    await this.notificationsService.markAllAsRead(user.sub);
    return { success: true };
  }
}
