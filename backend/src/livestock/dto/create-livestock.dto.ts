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
import { LivestockStatus } from '../livestock.entity';

export class CreateLivestockDto {
  @ApiProperty({ example: 'cattle', description: 'cattle, goat, sheep, poultry' })
  @IsString()
  species: string;

  @ApiProperty({ example: 'Holstein Friesian' })
  @IsString()
  breed: string;

  @ApiProperty({ example: '18 Months' })
  @IsString()
  age: string;

  @ApiProperty({ example: 450, description: 'Weight in Kg' })
  @IsNumber()
  @Min(0)
  weight: number;

  @ApiProperty({ example: 'Female' })
  @IsString()
  gender: string;

  @ApiPropertyOptional({ example: { anthrax: '2026-01-10', fmd: '2026-03-15' } })
  @IsOptional()
  @IsObject()
  vaccinationHistory?: Record<string, any>;

  @ApiPropertyOptional({ example: { dewormed: '2026-05-01' } })
  @IsOptional()
  @IsObject()
  medicalHistory?: Record<string, any>;

  @ApiProperty({ example: 'Healthy' })
  @IsString()
  healthStatus: string;

  @ApiPropertyOptional({ example: 'Not Pregnant' })
  @IsOptional()
  @IsString()
  pregnancyStatus?: string;

  @ApiPropertyOptional({ example: 'http://cert-url.pdf' })
  @IsOptional()
  @IsString()
  certification?: string;

  @ApiProperty({ example: 'Rahman Agro Farm' })
  @IsString()
  farmName: string;

  @ApiProperty({ example: 'Dhaka, Savar' })
  @IsString()
  location: string;

  @ApiPropertyOptional({ type: [String], example: ['buffalo.png'] })
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

  @ApiProperty({ example: 180000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isNegotiable?: boolean;

  @ApiPropertyOptional({ enum: LivestockStatus, default: LivestockStatus.DRAFT })
  @IsOptional()
  @IsEnum(LivestockStatus)
  status?: LivestockStatus;
}
