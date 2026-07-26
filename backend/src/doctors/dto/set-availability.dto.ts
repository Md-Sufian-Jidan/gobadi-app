import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  Matches,
  ValidateNested,
} from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class AvailabilityEntryDto {
  @ApiProperty({ description: '0=Sunday .. 6=Saturday', example: 1 })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @Matches(TIME_PATTERN, {
    message: 'startTime must be in HH:mm 24-hour format',
  })
  startTime: string;

  @ApiProperty({ example: '17:00' })
  @IsString()
  @Matches(TIME_PATTERN, { message: 'endTime must be in HH:mm 24-hour format' })
  endTime: string;

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @IsInt()
  @Min(5)
  slotDurationMinutes?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  bufferMinutes?: number;
}

export class SetAvailabilityDto {
  @ApiProperty({ type: [AvailabilityEntryDto] })
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityEntryDto)
  entries: AvailabilityEntryDto[];
}
