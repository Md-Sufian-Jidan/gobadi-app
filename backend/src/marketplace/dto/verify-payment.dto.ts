import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({ example: 'GBD-123456' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ example: 'txn_abc123' })
  @IsString()
  @IsNotEmpty()
  transactionId: string;
}
