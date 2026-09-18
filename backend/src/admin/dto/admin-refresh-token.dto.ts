import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminRefreshTokenDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  refreshToken: string;
}
