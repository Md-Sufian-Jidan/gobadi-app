import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { PaymentIntentDto } from './dto/payment-intent.dto';
import { Transaction } from './transaction.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a payment intent (returns simulation URLs)' })
  @ApiResponse({ status: 201, description: 'Payment intent registered' })
  async createIntent(
    @CurrentUser() user: JwtPayload,
    @Body() dto: PaymentIntentDto,
  ): Promise<Transaction> {
    return this.paymentsService.createIntent(user.sub, dto);
  }

  @Get('verify/:transactionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify/audit transaction status by transaction ID' })
  @ApiParam({ name: 'transactionId', example: 'uuid' })
  async verifyPayment(
    @Param('transactionId') transactionId: string,
  ): Promise<Transaction> {
    return this.paymentsService.verifyPayment(transactionId);
  }

  @Post('simulate-success')
  @SetMetadata('isProduction', process.env.NODE_ENV === 'production')
  @ApiOperation({ summary: 'Gateway simulation callback: Force success status' })
  @ApiResponse({ status: 200, description: 'Transaction marked successful' })
  async simulateSuccess(
    @Body() body: { transactionId: string; gatewayTxId?: string },
  ): Promise<Transaction> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Simulate routes are disabled in production');
    }
    return this.paymentsService.simulateSuccess(body.transactionId, body.gatewayTxId);
  }

  @Post('simulate-fail')
  @SetMetadata('isProduction', process.env.NODE_ENV === 'production')
  @ApiOperation({ summary: 'Gateway simulation callback: Force fail status' })
  @ApiResponse({ status: 200, description: 'Transaction marked failed' })
  async simulateFail(
    @Body() body: { transactionId: string },
  ): Promise<Transaction> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Simulate routes are disabled in production');
    }
    return this.paymentsService.simulateFail(body.transactionId);
  }
}
