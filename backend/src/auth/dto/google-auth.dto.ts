import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google ID token obtained from the client-side sign-in flow',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
