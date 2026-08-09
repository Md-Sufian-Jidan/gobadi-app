import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { NotificationType } from '../notification.entity';

export class SendNotificationDto {
  @ApiProperty({ example: [1, 2, 3], description: 'User IDs to notify' })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  userIds: number[];

  @ApiProperty({ example: 'Your order has shipped' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Order #1234 is on its way.' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({ enum: NotificationType, example: NotificationType.SYSTEM })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ example: 'Order' })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional({ example: '1234' })
  @IsOptional()
  @IsString()
  referenceId?: string;
}
