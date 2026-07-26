import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BookSlotDto {
  @ApiProperty({ example: '1' })
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({ example: '2026-08-01' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '10:30 AM' })
  @IsString()
  @IsNotEmpty()
  time: string;
}
