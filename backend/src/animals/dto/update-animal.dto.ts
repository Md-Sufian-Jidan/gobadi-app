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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dob?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  joinedFarm?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  liveWeight?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reproStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  photos?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photoCost?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sellingPrice?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  liveWeightPrice?: string;
}
