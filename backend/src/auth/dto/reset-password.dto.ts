import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Short-lived reset token returned by verify-otp',
  })
  @IsString()
  @IsNotEmpty()
  resetToken: string;

  @ApiProperty({
    description: 'New password (min 8 characters)',
    example: 'S3curePass',
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
