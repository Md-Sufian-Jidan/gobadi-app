import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class EditDiscountDto {
  @ApiProperty({ example: 20, description: 'Percent, 0-100' })
  @IsNumber()
  @Min(0)
  @Max(100)
  percent: number;
}
