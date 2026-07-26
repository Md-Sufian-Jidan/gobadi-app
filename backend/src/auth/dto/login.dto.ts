import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Phone number or email',
    example: '+8801XXXXXXXXX',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ description: 'Password', example: 'S3curePass' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
