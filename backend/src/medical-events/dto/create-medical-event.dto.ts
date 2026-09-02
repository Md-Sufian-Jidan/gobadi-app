import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
} from 'class-validator';
import { MedicalEventType } from '../medical-event.entity';

export class CreateMedicalEventDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  appointmentId: number;

  @ApiProperty({
    enum: MedicalEventType,
    example: MedicalEventType.CONSULTATION,
  })
  @IsEnum(MedicalEventType)
  type: MedicalEventType;

  @ApiProperty({
    description: 'Structured content, shape depends on `type`',
    example: {
      assessment: ['High fever for 3 days'],
      diagnosis: 'Pyrexia (high fever) likely due to bacterial infection',
      treatment: 'Meloxicam: 15 mg IM — once daily for 3 days',
    },
  })
  @IsObject()
  data: Record<string, unknown>;

  @ApiPropertyOptional({ example: '2026-08-20T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  nextFollowUpAt?: string;
}
