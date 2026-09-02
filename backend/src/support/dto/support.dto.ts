import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ example: 'Cannot access my account' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject: string;

  @ApiPropertyOptional({ example: 'I am unable to login since yesterday.' })
  @IsOptional()
  @IsString()
  message?: string;
}

export class ReplyTicketDto {
  @ApiProperty({ example: 'Please try resetting your password.' })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class UpdateTicketStatusDto {
  @ApiProperty({ example: 'in-progress', enum: ['open', 'in-progress', 'closed'] })
  @IsString()
  @IsNotEmpty()
  status: string;
}
