import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AlertsService, Alert } from '../alerts/alerts.service';
import { CreateAlertDto } from '../alerts/dto/create-alert.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/alerts')
export class AdminAlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @ApiOperation({ summary: 'Create and broadcast an alert (admin only)' })
  @ApiResponse({ status: 201, description: 'Alert created and broadcast' })
  async createAlert(@Body() body: CreateAlertDto): Promise<Alert> {
    return this.alertsService.createAlert(body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate an alert (admin only)' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'Alert deactivated' })
  async deactivateAlert(
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    await this.alertsService.deactivateAlert(parseInt(id, 10));
    return { success: true };
  }
}
