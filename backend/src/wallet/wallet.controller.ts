import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { WalletService, WalletTransaction } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { PaginatedResult } from '../common/paginated-result.interface';

class TopUpDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  method: string;
}

class PayDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsNumber()
  appointmentId?: number;

  @IsString()
  reason: string;
}

class EarnCoinsDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  reason: string;
}

class SpendCoinsDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  reason: string;
}

@ApiTags('wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: "Get the current user's wallet balance and coins" })
  @ApiResponse({ status: 200, description: 'Wallet balance and coins' })
  async getMyBalance(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ balance: number; coins: number }> {
    return this.walletService.getBalance(user.sub);
  }

  @Get('transactions')
  @ApiOperation({ summary: "List the current user's wallet ledger" })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Paginated wallet transactions' })
  async getMyTransactions(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedResult<WalletTransaction>> {
    return this.walletService.getTransactions(
      user.sub,
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Post('topup')
  @ApiOperation({ summary: 'Top up wallet balance' })
  @ApiResponse({ status: 201, description: 'Wallet topped up successfully' })
  async topUp(
    @CurrentUser() user: JwtPayload,
    @Body() dto: TopUpDto,
  ): Promise<{ balance: number; coins: number }> {
    return this.walletService.topUp(user.sub, dto.amount, dto.method);
  }

  @Post('pay')
  @ApiOperation({ summary: 'Pay from wallet balance' })
  @ApiResponse({ status: 201, description: 'Payment successful' })
  @ApiResponse({ status: 400, description: 'Insufficient balance' })
  async pay(
    @CurrentUser() user: JwtPayload,
    @Body() dto: PayDto,
  ): Promise<{ balance: number; coins: number }> {
    return this.walletService.pay(
      user.sub,
      dto.amount,
      dto.reason,
      dto.appointmentId ? 'Appointment' : undefined,
      dto.appointmentId ? String(dto.appointmentId) : undefined,
    );
  }

  @Post('earn-coins')
  @ApiOperation({ summary: 'Earn coins (internal)' })
  @ApiResponse({ status: 201, description: 'Coins earned' })
  async earnCoins(
    @CurrentUser() user: JwtPayload,
    @Body() dto: EarnCoinsDto,
  ): Promise<{ balance: number; coins: number }> {
    return this.walletService.earnCoins(user.sub, dto.amount, dto.reason);
  }

  @Post('spend-coins')
  @ApiOperation({ summary: 'Spend coins (internal)' })
  @ApiResponse({ status: 201, description: 'Coins spent' })
  @ApiResponse({ status: 400, description: 'Insufficient coins' })
  async spendCoins(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SpendCoinsDto,
  ): Promise<{ balance: number; coins: number }> {
    return this.walletService.spendCoins(user.sub, dto.amount, dto.reason);
  }
}
