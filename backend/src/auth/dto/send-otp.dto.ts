import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { OtpPurpose } from '../otp-purpose.type';
import { IsPhoneOrEmail } from '../../common/validators/is-phone-or-email.validator';

export class SendOtpDto {
  @ApiProperty({
    description: 'Phone number or email to send the OTP to',
    example: '+8801XXXXXXXXX',
  })
  @IsString()
  @IsNotEmpty()
  @IsPhoneOrEmail()
  phone: string;

  @ApiPropertyOptional({
    description: 'What the OTP will be used for',
    enum: ['login', 'verify', 'reset'],
  })
  @IsOptional()
  @IsIn(['login', 'verify', 'reset'])
  purpose?: OtpPurpose;
}
