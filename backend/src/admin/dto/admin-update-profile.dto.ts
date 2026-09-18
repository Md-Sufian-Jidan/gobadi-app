import { IsOptional, IsString, MinLength, MaxLength, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AdminDesignation } from '../entities/admin.entity';

export class AdminUpdateProfileDto {
  @ApiPropertyOptional({ example: 'Admin User' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ enum: AdminDesignation })
  @IsOptional()
  @IsEnum(AdminDesignation)
  designation?: AdminDesignation;

  @ApiPropertyOptional({ example: 'newpassword123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password?: string;
}
