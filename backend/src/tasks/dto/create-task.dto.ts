import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TaskPriority } from '../task.entity';

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

  @ApiPropertyOptional({ example: 'animal', enum: ['field', 'animal', 'appointment', 'other'] })
  @IsOptional()
  @IsString()
  @IsIn(['field', 'animal', 'appointment', 'other'])
  category?: string;

  @ApiPropertyOptional({ example: 'medium', enum: TaskPriority })
  @IsOptional()
  @IsIn(Object.values(TaskPriority))
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: '2026-08-15' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
