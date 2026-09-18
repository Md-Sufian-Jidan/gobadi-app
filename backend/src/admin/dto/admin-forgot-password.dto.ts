import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminForgotPasswordDto {
  @ApiProperty({ example: 'admin@gobadi.com' })
  @IsEmail()
  email: string;
}
