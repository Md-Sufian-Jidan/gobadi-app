import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { PaymentMethod } from './payment-method.entity';

@ApiTags('payment-methods')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  @ApiOperation({ summary: "List user's payment methods" })
  async list(@CurrentUser() user: JwtPayload): Promise<PaymentMethod[]> {
    return this.paymentMethodsService.list(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Add a payment method' })
  @ApiResponse({ status: 201, description: 'Payment method created' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    return this.paymentMethodsService.create(user.sub, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a payment method (owner-only)' })
  @ApiParam({ name: 'id', example: '1' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { maskedNumber?: string; provider?: string },
  ): Promise<PaymentMethod> {
    return this.paymentMethodsService.update(
      parseInt(id, 10),
      user.sub,
      body,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a payment method (owner-only)' })
  @ApiParam({ name: 'id', example: '1' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: boolean }> {
    await this.paymentMethodsService.remove(parseInt(id, 10), user.sub);
    return { success: true };
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Set as default payment method (owner-only)' })
  @ApiParam({ name: 'id', example: '1' })
  async setDefault(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaymentMethod> {
    return this.paymentMethodsService.setDefault(parseInt(id, 10), user.sub);
  }

  @Post(':id/verify-otp')
  @ApiOperation({ summary: 'Verify payment method with OTP' })
  @ApiParam({ name: 'id', example: '1' })
  async verifyOtp(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { otp: string },
  ): Promise<PaymentMethod> {
    return this.paymentMethodsService.verifyOtp(parseInt(id, 10), user.sub, body.otp);
  }
}
