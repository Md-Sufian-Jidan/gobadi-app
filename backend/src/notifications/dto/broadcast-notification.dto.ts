import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NotificationType } from '../notification.entity';
import { UserRole } from '../../users/user.entity';

export class BroadcastNotificationDto {
  @ApiProperty({ example: 'Scheduled maintenance tonight' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'The app will be briefly unavailable at 2 AM.' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({ enum: NotificationType, example: NotificationType.SYSTEM })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({
    enum: UserRole,
    description: 'Restrict the broadcast to a single role; omit to notify everyone',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
