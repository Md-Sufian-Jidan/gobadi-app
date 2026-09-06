import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({
    example: 1,
    description: 'Appointment ID to start video call for',
  })
  @IsNumber()
  @IsNotEmpty()
  appointmentId: number;
}
