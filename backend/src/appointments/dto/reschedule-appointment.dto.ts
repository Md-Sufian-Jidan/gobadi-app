import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RescheduleAppointmentDto {
  @ApiProperty({ example: '2026-08-02' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '11:30 AM' })
  @IsString()
  @IsNotEmpty()
  time: string;
}
