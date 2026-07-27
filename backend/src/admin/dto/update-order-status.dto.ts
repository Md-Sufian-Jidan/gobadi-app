import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

const ORDER_STATUSES = ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ORDER_STATUSES, example: 'SHIPPED' })
  @IsIn(ORDER_STATUSES)
  status: string;
}
