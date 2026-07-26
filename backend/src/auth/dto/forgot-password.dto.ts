import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Phone number or email to send the reset OTP to',
    example: '+8801XXXXXXXXX',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;
}
