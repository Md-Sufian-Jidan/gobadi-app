import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSingleDayDto {
  @ApiPropertyOptional({ example: '09:00' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ example: '17:00' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  slotDurationMinutes?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  bufferMinutes?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2026-08-15' })
  @IsOptional()
  @IsString()
  specificDate?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: ['09:00-09:30', '10:00-10:30'] })
  @IsOptional()
  overrideSlots?: string[];
}
