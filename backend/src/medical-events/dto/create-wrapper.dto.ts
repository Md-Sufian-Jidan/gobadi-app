import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
} from 'class-validator';
import { MedicalEventType } from '../medical-event.entity';

export class CreateLabTestDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  appointmentId: number;

  @ApiProperty({ example: 1, description: 'Animal.id (patient)' })
  @IsInt()
  animalId: number;

  @ApiProperty({
    description: 'Structured content for lab test',
    example: { testName: 'CBC', results: 'Normal range', notes: '' },
  })
  @IsObject()
  data: Record<string, unknown>;
}

export class CreateVaccinationDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  appointmentId: number;

  @ApiProperty({ example: 1, description: 'Animal.id (patient)' })
  @IsInt()
  animalId: number;

  @ApiProperty({
    description: 'Structured content for vaccination',
    example: { vaccine: 'Rabies', dose: '1ml', route: 'IM' },
  })
  @IsObject()
  data: Record<string, unknown>;
}
