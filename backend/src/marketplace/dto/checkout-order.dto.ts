import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CheckoutItemDto {
  @ApiProperty({ example: '1' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CheckoutOrderDto {
  @ApiProperty({ type: [CheckoutItemDto] })
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @ApiProperty({ example: '123 Farm Road, Dhaka' })
  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;
}
