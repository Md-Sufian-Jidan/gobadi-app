import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SetPasswordDto {
  @ApiProperty({
    description: 'New password (min 8 characters)',
    example: 'S3curePass',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}
