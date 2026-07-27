import {
  Controller,
  Get,
  Post,
  Param,
  Body,
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
import { MarketplaceService, MarketItem, Order } from './marketplace.service';
import { CheckoutOrderDto } from './dto/checkout-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { PaginatedResult } from '../common/paginated-result.interface';

@ApiTags('marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get()
  @ApiOperation({ summary: 'List the marketplace catalog' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'List of catalog items' })
  async getCatalog(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<MarketItem[] | PaginatedResult<MarketItem>> {
    return this.marketplaceService.getCatalog(
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a catalog item by id' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'The catalog item' })
  async getCatalogItemById(@Param('id') id: string): Promise<MarketItem> {
    return this.marketplaceService.getCatalogItemById(id);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Checkout an order' })
  @ApiResponse({ status: 201, description: 'Order created' })
  async checkoutOrder(@Body() body: CheckoutOrderDto): Promise<Order> {
    return this.marketplaceService.checkoutOrder(body);
  }

  @Post('verify-payment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify payment for an order' })
  @ApiResponse({
    status: 201,
    description: 'Order updated with payment verification',
  })
  async verifyPayment(@Body() body: VerifyPaymentDto): Promise<Order> {
    return this.marketplaceService.verifyPayment(
      body.orderId,
      body.transactionId,
    );
  }

  @Get('orders/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all orders (admin only)' })
  @ApiResponse({ status: 200, description: 'List of orders' })
  async getOrders(): Promise<Order[] | PaginatedResult<Order>> {
    return this.marketplaceService.getOrders();
  }
}
