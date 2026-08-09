import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsOptional, IsString } from 'class-validator';

export class CreateAiDiagnosisDto {
  @ApiPropertyOptional({ type: [String], example: ['https://res.cloudinary.com/demo/image/upload/cow.png'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ type: [String], example: ['fever', 'loss of appetite', 'skin lesions'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  symptoms: string[];
}
