import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../users/user.entity';

export class RegisterDto {
  @ApiPropertyOptional({ description: 'Full name', example: 'Abdul Kader' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Phone number', example: '+8801XXXXXXXXX' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'hello@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

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
