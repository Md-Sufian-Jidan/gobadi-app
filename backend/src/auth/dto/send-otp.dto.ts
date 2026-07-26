import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { OtpPurpose } from '../otp-purpose.type';

export class SendOtpDto {
  @ApiProperty({
    description: 'Phone number or email to send the OTP to',
    example: '+8801XXXXXXXXX',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({
    description: 'What the OTP will be used for',
    enum: ['login', 'verify', 'reset'],
  })
  @IsOptional()
  @IsIn(['login', 'verify', 'reset'])
  purpose?: OtpPurpose;
}
