import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class ApplyDiscountDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  patientId: number;

  @ApiProperty({ example: 15, description: 'Percent, 0-100' })
  @IsNumber()
  @Min(0)
  @Max(100)
  percent: number;
}
