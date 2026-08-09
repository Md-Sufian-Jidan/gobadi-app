import {
  Body,
  Controller,
  Delete,
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
import { CartService, CartSummary } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItem } from './cart-item.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: "Get current user's cart summary with price and stock checks" })
  @ApiResponse({ status: 200, description: 'Cart summary details' })
  async getCart(@CurrentUser() user: JwtPayload): Promise<CartSummary> {
    return this.cartService.getCart(user.sub);
  }

  @Post('add')
  @ApiOperation({ summary: 'Add a product or livestock item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart' })
  async addItem(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AddCartItemDto,
  ): Promise<CartItem> {
    return this.cartService.addItem(user.sub, dto);
  }

  @Put('item/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'Cart item updated' })
  async updateItem(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: UpdateCartItemDto,
  ): Promise<CartItem> {
    return this.cartService.updateItem(parseInt(id, 10), user.sub, body.quantity);
  }

  @Delete('item/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'Item removed' })
  async removeItem(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.cartService.removeItem(parseInt(id, 10), user.sub);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all items from user cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared' })
  async clearCart(@CurrentUser() user: JwtPayload): Promise<void> {
    return this.cartService.clearCart(user.sub);
  }
}
