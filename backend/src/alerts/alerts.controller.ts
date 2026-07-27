import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AlertsService, Alert } from './alerts.service';
import { AlertActionDto } from './dto/alert-action.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@ApiTags('alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'List active regional crop/disease risk alerts' })
  @ApiResponse({ status: 200, description: 'List of active alerts' })
  async getAlerts(): Promise<Alert[]> {
    return this.alertsService.getActiveAlerts();
  }

  @Post(':id/action')
  @ApiOperation({ summary: "Dispatch the user's chosen action on an alert" })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 201, description: 'Action dispatched' })
  async takeAction(
    @Param('id') id: string,
    @Body() body: AlertActionDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: boolean }> {
    return this.alertsService.recordAction(
      parseInt(id, 10),
      user.sub,
      body.actionChoice,
    );
  }
}
