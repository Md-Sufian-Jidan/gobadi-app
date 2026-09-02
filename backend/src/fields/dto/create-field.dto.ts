import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDecimal, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFieldDto {
  @ApiProperty({ example: 'North Farm' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 5.5 })
  @IsDecimal({ decimal_digits: '2' })
  sizeAcres: number;

  @ApiPropertyOptional({ example: 'Rice' })
  @IsOptional()
  @IsString()
  cropType?: string;

  @ApiPropertyOptional({ example: 'Dhaka, Bangladesh' })
  @IsOptional()
  @IsString()
  location?: string;
}
