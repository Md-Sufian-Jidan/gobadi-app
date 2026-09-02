import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MedicineDto } from './create-prescription.dto';

export class UpdatePrescriptionDto {
  @ApiPropertyOptional({ type: [MedicineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicineDto)
  medicines?: MedicineDto[];
}
