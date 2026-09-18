import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminResetPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  resetToken: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  newPassword: string;
}
