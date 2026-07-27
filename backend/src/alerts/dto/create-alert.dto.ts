import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AlertActionType, AlertSeverity } from '../alert.entity';

export class CreateAlertDto {
  @ApiProperty({ example: 'High Risk of Leaf Miner' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'North Fields' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 'Wheat' })
  @IsString()
  @IsNotEmpty()
  crop: string;

  @ApiProperty({ enum: AlertSeverity, example: AlertSeverity.HIGH })
  @IsEnum(AlertSeverity)
  severity: AlertSeverity;

  @ApiProperty({ enum: AlertActionType, example: AlertActionType.MANAGE })
  @IsEnum(AlertActionType)
  actionType: AlertActionType;
}
