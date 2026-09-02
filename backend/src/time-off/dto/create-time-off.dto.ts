import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { TimeOffReason } from '../doctor-time-off.entity';

export class CreateTimeOffDto {
  @ApiProperty({ example: '2026-08-24' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-08-26' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ enum: TimeOffReason, example: TimeOffReason.VACATION })
  @IsEnum(TimeOffReason)
  reason: TimeOffReason;

  @ApiPropertyOptional({ example: 'I need a vacation' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    description:
      'If existing appointments conflict with this range, the first call without force returns 409 with the conflict list and fee estimate. Set true to confirm — this cancels the conflicting appointments, refunds patients, and deducts the doctor wallet.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}
