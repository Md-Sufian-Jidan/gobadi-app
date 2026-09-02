import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional } from 'class-validator';
import { MedicalEventStatus } from '../medical-event.entity';

export class UpdateMedicalEventDto {
  @ApiPropertyOptional({ enum: MedicalEventStatus })
  @IsOptional()
  @IsEnum(MedicalEventStatus)
  status?: MedicalEventStatus;

  @ApiPropertyOptional({ description: 'Merged into the existing data object' })
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}
