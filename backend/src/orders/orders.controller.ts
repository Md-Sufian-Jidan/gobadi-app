import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from './order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { PaginatedResult } from '../common/paginated-result.interface';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Place a new product/livestock order from the shopping cart' })
  @ApiResponse({ status: 201, description: 'Order created' })
  async placeOrder(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateOrderDto,
  ): Promise<Order> {
    return this.ordersService.placeOrder(user.sub, dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get currently logged-in user's orders list" })
  @ApiResponse({ status: 200, description: 'Orders list' })
  async getMyOrders(@CurrentUser() user: JwtPayload): Promise<Order[]> {
    return this.ordersService.getMyOrders(user.sub);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all orders (Admin only)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, description: 'Paginated orders' })
  async getOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: OrderStatus,
  ): Promise<Order[] | PaginatedResult<Order>> {
    return this.ordersService.getOrders(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
      status,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get single order details by ID' })
  @ApiParam({ name: 'id', example: 'GBD-123456' })
  @ApiResponse({ status: 200, description: 'Order detail' })
  async getOrderDetails(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<Order> {
    return this.ordersService.getOrderDetails(id, user.sub);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  @ApiParam({ name: 'id', example: 'GBD-123456' })
  @ApiResponse({ status: 200, description: 'Order updated' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus },
  ): Promise<Order> {
    return this.ordersService.updateStatus(id, body.status);
  }
}
