import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsDecimal, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMarketRateDto {
  @ApiProperty({ example: 'Rice' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  commodity: string;

  @ApiProperty({ example: 45.50 })
  @IsDecimal({ decimal_digits: '2' })
  price: number;

  @ApiProperty({ example: 'kg' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ example: '2026-08-25' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'Dhaka' })
  @IsOptional()
  @IsString()
  region?: string;
}
