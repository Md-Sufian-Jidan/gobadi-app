import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FacebookAuthDto {
  @ApiProperty({
    description:
      'Facebook access token obtained from the client-side sign-in flow',
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
