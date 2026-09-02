import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaymentMethodType } from '../payment-method.entity';

export class CreatePaymentMethodDto {
  @ApiProperty({ enum: PaymentMethodType, example: PaymentMethodType.BKASH })
  @IsEnum(PaymentMethodType)
  type: PaymentMethodType;

  @ApiPropertyOptional({ example: '01712345678' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  maskedNumber?: string;

  @ApiPropertyOptional({ example: 'bKash' })
  @IsOptional()
  @IsString()
  provider?: string;
}
