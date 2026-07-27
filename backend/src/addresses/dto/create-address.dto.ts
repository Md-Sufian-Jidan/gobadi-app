import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Farm' })
  @IsString()
  label: string;

  @ApiProperty({ example: 'Abdur Rahman' })
  @IsString()
  contactName: string;

  @ApiProperty({ example: '+8801700000003' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Dhaka' })
  @IsString()
  division: string;

  @ApiProperty({ example: 'Dhaka' })
  @IsString()
  district: string;

  @ApiProperty({ example: 'Savar' })
  @IsString()
  upazila: string;

  @ApiProperty({ example: '1340' })
  @IsString()
  postalCode: string;

  @ApiPropertyOptional({ example: 23.8103 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 90.4125 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
