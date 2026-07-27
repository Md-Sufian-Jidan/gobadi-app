import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ProductStatus } from '../product.entity';

export class CreateProductDto {
  @ApiProperty({ example: 'PRD-102-FEED' })
  @IsString()
  sku: string;

  @ApiPropertyOptional({ example: '880123456789' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ example: 'Organic Cattle Feed' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'High protein feed for cows and goats.' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1250 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  brandId?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({ example: { weight: '25kg', type: 'mash' } })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;

  @ApiPropertyOptional({ example: 'Feed 2-3 times daily with plenty of water.' })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({ type: [String], example: ['feed_thumb.png'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ type: [String], example: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videos?: string[];

  @ApiPropertyOptional({ type: [String], example: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @ApiPropertyOptional({ example: 'Organic Cattle Feed - High Protein' })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'Buy organic cattle feed online.' })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({ example: 'cattle feed, cow feed, organic feed' })
  @IsOptional()
  @IsString()
  seoKeywords?: string;

  @ApiPropertyOptional({ enum: ProductStatus, default: ProductStatus.DRAFT })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  visibility?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPrescriptionRequired?: boolean;
}
