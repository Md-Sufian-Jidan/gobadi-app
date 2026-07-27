import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { AlertActionType } from '../alert.entity';

export class AlertActionDto {
  @ApiProperty({ enum: AlertActionType, example: AlertActionType.MANAGE })
  @IsEnum(AlertActionType)
  actionChoice: AlertActionType;
}
