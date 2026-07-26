import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'Hello, doctor!' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({
    required: false,
    description: 'Target conversation; auto-resolved for patients if omitted',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  conversationId?: number;
}
