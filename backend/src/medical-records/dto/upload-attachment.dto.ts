import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadAttachmentDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @ApiProperty({
    required: false,
    description: 'Doctor-only: upload on behalf of this patient user id',
  })
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  appointmentId?: string;
}
