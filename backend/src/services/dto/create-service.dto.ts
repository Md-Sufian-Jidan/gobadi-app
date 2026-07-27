import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ProviderType } from '../service.entity';

export class CreateServiceDto {
  @ApiProperty({ enum: ProviderType })
  @IsEnum(ProviderType)
  providerType: ProviderType;

  @ApiProperty({ example: 1 })
  @IsNumber()
  providerId: number;

  @ApiProperty({ example: 'Cattle General Checkup' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Complete health checkup including vaccination evaluation.' })
  @IsString()
  description: string;

  @ApiProperty({ example: 30, description: 'Duration in minutes' })
  @IsNumber()
  @Min(5)
  durationMinutes: number;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 'Ensure animal has not been fed for 2 hours before the checkup.' })
  @IsOptional()
  @IsString()
  preparationInstructions?: string;

  @ApiPropertyOptional({ example: 'NID or owner verification document.' })
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isOffline?: boolean;

  @ApiPropertyOptional({ example: 'Savar Hub Clinic' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'Free cancellation up to 2 hours before appointment.' })
  @IsOptional()
  @IsString()
  cancellationPolicy?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;
}
