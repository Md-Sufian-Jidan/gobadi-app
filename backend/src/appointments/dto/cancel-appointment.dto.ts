import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CancelAppointmentDto {
  @ApiProperty({
    example: 'Family emergency, need to reschedule',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ example: 'Will contact to reschedule' })
  @IsOptional()
  @IsString()
  note?: string;
}
