import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  addressId: number;

  @ApiProperty({ example: 'standard', description: 'standard, express, same_day, store_pickup, seller_pickup' })
  @IsString()
  deliveryMethod: string;

  @ApiPropertyOptional({ example: 'Please call before delivery' })
  @IsOptional()
  @IsString()
  deliveryNotes?: string;
}
