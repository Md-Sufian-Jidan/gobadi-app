import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Feed Animals' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Morning feed for cattle', required: false })
  @IsOptional()
  @IsString()
  detail?: string;

  @ApiProperty({ example: '2026-07-27T06:30:00.000Z' })
  @IsDateString()
  scheduledTime: string;
}
