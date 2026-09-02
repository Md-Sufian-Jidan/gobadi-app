import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MedicineDto {
  @ApiProperty({ example: 'Amoxicillin' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '500mg twice daily' })
  @IsString()
  @IsNotEmpty()
  dosage: string;

  @ApiProperty({ example: '7 days' })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiPropertyOptional({ example: 'Take with food' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePrescriptionDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  appointmentId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  animalId: number;

  @ApiProperty({ type: [MedicineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicineDto)
  medicines: MedicineDto[];
}
