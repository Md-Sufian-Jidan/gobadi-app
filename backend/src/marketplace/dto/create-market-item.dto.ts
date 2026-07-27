import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateMarketItemDto {
  @ApiProperty({ example: 'Kota Goat' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 16000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'Animals' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ example: 'https://example.com/goat.jpg' })
  @IsOptional()
  @IsString()
  image?: string;
}
