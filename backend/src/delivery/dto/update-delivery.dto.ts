import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DeliveryStatus } from '../delivery.entity';

export class UpdateDeliveryDto {
  @ApiProperty({ enum: DeliveryStatus })
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;

  @ApiPropertyOptional({ example: 'Savar Hub' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'Shipment has arrived at distribution center' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'http://proof-photo.jpg' })
  @IsOptional()
  @IsString()
  deliveryProofUrl?: string;

  @ApiPropertyOptional({ example: 'Customer was not present, scheduled for retry' })
  @IsOptional()
  @IsString()
  deliveryNotes?: string;
}
