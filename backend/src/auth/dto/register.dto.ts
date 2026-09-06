import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../users/user.entity';
import { IsPhoneOrEmail } from '../../common/validators/is-phone-or-email.validator';

export class RegisterDto {
  @ApiProperty({ description: 'Full name', example: 'Abdul Kader' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Phone number or email address',
    example: '+8801XXXXXXXXX',
  })
  @IsNotEmpty()
  @IsString()
  @IsPhoneOrEmail()
  identifier: string;

  @ApiProperty({
    description: 'Password (min 8 characters)',
    example: 'S3curePass',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: UserRole, description: 'Account role' })
  @IsEnum(UserRole)
  role: UserRole;
}
