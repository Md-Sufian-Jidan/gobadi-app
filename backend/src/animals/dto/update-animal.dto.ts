import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAnimalDto {
  @ApiPropertyOptional({ example: 'Bella' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Holstein' })
  @IsOptional()
  @IsString()
  breed?: string;

  @ApiPropertyOptional({ example: '450kg' })
  @IsOptional()
  @IsString()
  weight?: string;

  @ApiPropertyOptional({ example: '3 years' })
  @IsOptional()
  @IsString()
  age?: string;

  @ApiPropertyOptional({ example: 'Brown & White' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 'https://example.com/animal.jpg' })
  @IsOptional()
  @IsString()
  image?: string;
}
