import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { DiscountsService, Discount } from './discounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

class ValidateDiscountDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

class ApplyDiscountDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  appointmentId: number;
}

@ApiTags('discounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('discounts')
export class UserDiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Get('available')
  @ApiOperation({ summary: 'Get available discount codes for the current user' })
  @ApiResponse({ status: 200, description: 'List of available discounts' })
  async getAvailable(
    @CurrentUser() user: JwtPayload,
  ): Promise<Discount[]> {
    return this.discountsService.getAvailableDiscounts();
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate a discount code' })
  @ApiResponse({ status: 200, description: 'Discount is valid' })
  @ApiResponse({ status: 404, description: 'Invalid or expired code' })
  async validate(
    @Body() dto: ValidateDiscountDto,
  ): Promise<Discount> {
    return this.discountsService.validateDiscountCode(dto.code);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply a discount code to an appointment' })
  @ApiResponse({ status: 200, description: 'Discount applied' })
  @ApiResponse({ status: 400, description: 'Invalid code or appointment' })
  async apply(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ApplyDiscountDto,
  ): Promise<{ success: boolean; discountPercent: number }> {
    return this.discountsService.applyDiscountCode(
      user.sub,
      dto.code,
      dto.appointmentId,
    );
  }

  @Get('my')
  @ApiOperation({ summary: "Get the current user's discount usage history" })
  @ApiResponse({ status: 200, description: 'Discount history' })
  async getMyDiscounts(
    @CurrentUser() user: JwtPayload,
  ): Promise<Discount[]> {
    return this.discountsService.getUserDiscountHistory(user.sub);
  }
}
