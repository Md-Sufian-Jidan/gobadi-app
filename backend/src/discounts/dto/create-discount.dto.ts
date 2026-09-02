import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateDiscountDto {
  @ApiProperty({ example: 'SAVE20' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9]{1,10}$/, {
    message: 'Code must be alphanumeric, max 10 characters',
  })
  code: string;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(1)
  @Max(100)
  percent: number;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  validTo?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsIn([true, false])
  isActive?: boolean;
}
