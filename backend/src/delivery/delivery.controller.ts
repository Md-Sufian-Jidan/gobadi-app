import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { Delivery } from './delivery.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('delivery')
@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get('track/:trackingNumber')
  @ApiOperation({ summary: 'Public tracking of shipment via tracking number' })
  @ApiParam({ name: 'trackingNumber', example: 'GBD-TRK-XXXXXXXX' })
  @ApiResponse({ status: 200, description: 'Delivery status timeline' })
  async getDeliveryByTrackingNumber(
    @Param('trackingNumber') trackingNumber: string,
  ): Promise<Delivery> {
    return this.deliveryService.getDeliveryByTrackingNumber(trackingNumber);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shipment tracking details for an order (Authenticated)' })
  @ApiParam({ name: 'orderId', example: 'GBD-123456' })
  async getDeliveryByOrderId(
    @Param('orderId') orderId: string,
  ): Promise<Delivery> {
    return this.deliveryService.getDeliveryByOrderId(orderId);
  }

  @Post('order/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create shipment/courier assignment (Admin only)' })
  @ApiParam({ name: 'orderId', example: 'GBD-123456' })
  async createDelivery(
    @Param('orderId') orderId: string,
    @Body() body: { courierName: string },
  ): Promise<Delivery> {
    return this.deliveryService.createDelivery(orderId, body.courierName);
  }

  @Put('order/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update shipment status and timeline event (Admin only)' })
  @ApiParam({ name: 'orderId', example: 'GBD-123456' })
  async updateDelivery(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateDeliveryDto,
  ): Promise<Delivery> {
    return this.deliveryService.updateDelivery(orderId, dto);
  }
}
