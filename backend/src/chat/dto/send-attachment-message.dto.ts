import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class SendAttachmentMessageDto {
  @ApiProperty({
    required: false,
    description: 'Target conversation; auto-resolved for patients if omitted',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  conversationId?: number;

  @ApiProperty({
    required: false,
    description: 'Optional caption to send with the attachment',
  })
  @IsOptional()
  @IsString()
  caption?: string;
}
