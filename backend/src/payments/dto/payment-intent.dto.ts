import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PaymentIntentDto {
  @ApiProperty({ example: 1250 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ example: 'GBD-123456' })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  bookingId?: number;

  @ApiPropertyOptional({ example: 'simulate', default: 'simulate' })
  @IsOptional()
  @IsString()
  provider?: string;
}
