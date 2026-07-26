import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { OtpPurpose } from '../otp-purpose.type';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Phone number or email the OTP was sent to',
    example: '+8801XXXXXXXXX',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'The OTP code received', example: '1234' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({
    description: 'What the OTP is being used for',
    enum: ['login', 'verify', 'reset'],
  })
  @IsOptional()
  @IsIn(['login', 'verify', 'reset'])
  purpose?: OtpPurpose;
}
