import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { DiscountsService, Discount } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('admin-discounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/discounts')
export class AdminDiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a discount promo code' })
  @ApiResponse({ status: 201, description: 'Discount created' })
  async create(@Body() dto: CreateDiscountDto): Promise<Discount> {
    return this.discountsService.createDiscount(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a discount promo code' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'Discount updated' })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateDiscountDto>,
  ): Promise<Discount> {
    return this.discountsService.updateDiscount(parseInt(id, 10), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a discount promo code' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'Discount deleted' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.discountsService.deleteDiscount(parseInt(id, 10));
    return { success: true };
  }
}
