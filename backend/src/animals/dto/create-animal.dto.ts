import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAnimalDto {
  @ApiProperty({ example: 'Bella' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Holstein' })
  @IsString()
  @IsNotEmpty()
  breed: string;

  @ApiProperty({ example: '450kg' })
  @IsString()
  @IsNotEmpty()
  weight: string;

  @ApiProperty({ example: '3 years' })
  @IsString()
  @IsNotEmpty()
  age: string;

  @ApiProperty({ example: 'Brown & White' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiPropertyOptional({ example: 'https://example.com/animal.jpg' })
  @IsOptional()
  @IsString()
  image?: string;
}
