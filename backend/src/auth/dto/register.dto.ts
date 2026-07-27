import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../users/user.entity';

export const RegisterRole = {
  ...UserRole,
  PATIENT: 'patient' as any,
};

export class RegisterDto {
  @ApiPropertyOptional({ description: 'Full name', example: 'Abdul Kader' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Phone number (either phone or email is required)',
    example: '+8801XXXXXXXXX',
  })
  @IsOptional()
  @IsString()
  phone?: string;

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

  @ApiProperty({ enum: RegisterRole, description: 'Account role' })
  @IsEnum(RegisterRole)
  role: UserRole;
}
