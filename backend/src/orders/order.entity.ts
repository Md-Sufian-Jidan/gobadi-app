import {
  Entity,
  PrimaryColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  PACKED = 'packed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  RETURNED = 'returned',
  FAILED = 'failed',
}

@Entity('orders')
export class Order {
  @PrimaryColumn()
  id: string; // Format: GBD-xxxxxx

  @Index()
  @Column('int')
  userId: number;

  @Column('float')
  totalPrice: number;

  @Column('float')
  tax: number;

  @Column('float')
  shippingFee: number;

  @Column('float', { default: 0 })
  discountAmount: number;

  @Column('float')
  netAmount: number;

  @Column('jsonb')
  deliveryAddress: Record<string, any>; // Snapshot of address details to prevent changes

  @Column()
  deliveryMethod: string; // standard, express, same_day, store_pickup, seller_pickup

  @Column({ nullable: true })
  trackingNumber?: string;

  @Column('timestamptz', { nullable: true })
  eta?: Date;

  @Index()
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ default: 'pending' })
  paymentStatus: string; // pending, processing, successful, failed, cancelled, refunded

  @Column({ nullable: true })
  transactionId?: string;

  @Column({ nullable: true })
  deliveryNotes?: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
