import { IsEmail, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminSendOtpDto {
  @ApiProperty({ example: 'admin@gobadi.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ enum: ['verify', 'reset'], default: 'verify' })
  @IsOptional()
  @IsEnum(['verify', 'reset'] as const)
  purpose?: 'verify' | 'reset';
}
