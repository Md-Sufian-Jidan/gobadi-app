import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateClinicDto {
  @ApiProperty({ example: 'Savar Veterinary Clinic' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Dhaka, Savar' })
  @IsString()
  location: string;

  @ApiProperty({ example: 'Providing comprehensive medical care for farm and domestic animals.' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: { mon_fri: '09:00-18:00', sat: '10:00-14:00' } })
  @IsOptional()
  @IsObject()
  businessHours?: Record<string, any>;

  @ApiPropertyOptional({ example: 'clinic_logo.png' })
  @IsOptional()
  @IsString()
  avatar?: string;
}
