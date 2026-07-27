import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CreateAiDiagnosisDto {
  @ApiProperty({ type: [String], example: ['http://demo.png'] })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiProperty({ type: [String], example: ['fever', 'loss of appetite', 'skin lesions'] })
  @IsArray()
  @IsString({ each: true })
  symptoms: string[];
}
