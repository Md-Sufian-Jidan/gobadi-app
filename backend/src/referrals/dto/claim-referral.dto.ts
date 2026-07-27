import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ClaimReferralDto {
  @ApiProperty({ example: 'FARM-8X29' })
  @IsString()
  @IsNotEmpty()
  code: string;
}
