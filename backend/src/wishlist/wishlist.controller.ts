import {
  Body,
  Controller,
  Delete,
  Get,
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
import { WishlistService } from './wishlist.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { WishlistItem } from './wishlist-item.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@ApiTags('wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: "Get current user's wishlist" })
  @ApiResponse({ status: 200, description: 'Wishlist items list' })
  async getWishlist(@CurrentUser() user: JwtPayload): Promise<WishlistItem[]> {
    return this.wishlistService.getWishlist(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Add a product or livestock item to wishlist' })
  @ApiResponse({ status: 201, description: 'Added to wishlist' })
  async addItem(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AddWishlistItemDto,
  ): Promise<WishlistItem> {
    return this.wishlistService.addItem(user.sub, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove item from wishlist' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'Removed from wishlist' })
  async removeItem(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.wishlistService.removeItem(parseInt(id, 10), user.sub);
  }
}
