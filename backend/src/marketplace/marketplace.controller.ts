import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MarketplaceService, MarketItem, Order } from './marketplace.service';
import { CheckoutOrderDto } from './dto/checkout-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@ApiTags('marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get()
  @ApiOperation({ summary: 'List the marketplace catalog' })
  @ApiResponse({ status: 200, description: 'List of catalog items' })
  async getCatalog(): Promise<MarketItem[]> {
    return this.marketplaceService.getCatalog();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a catalog item by id' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'The catalog item' })
  async getCatalogItemById(@Param('id') id: string): Promise<MarketItem> {
    return this.marketplaceService.getCatalogItemById(id);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Checkout an order' })
  @ApiResponse({ status: 201, description: 'Order created' })
  async checkoutOrder(@Body() body: CheckoutOrderDto): Promise<Order> {
    return this.marketplaceService.checkoutOrder(body);
  }

  @Post('verify-payment')
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
  @ApiOperation({ summary: 'List all orders' })
  @ApiResponse({ status: 200, description: 'List of orders' })
  async getOrders(): Promise<Order[]> {
    return this.marketplaceService.getOrders();
  }
}
