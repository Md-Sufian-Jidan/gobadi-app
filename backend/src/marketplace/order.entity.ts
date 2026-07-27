import { Entity, PrimaryColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryColumn()
  id: string;

  @Index()
  @Column('int', { nullable: true })
  userId?: number | null;

  @Column('float')
  totalPrice: number;

  @Column()
  deliveryAddress: string;

  @Index()
  @Column({ default: 'Placed' })
  status: string;

  @Column({ nullable: true })
  transactionId?: string;

  @Column({ default: 'Pending' })
  paymentStatus: string;

  @Column('jsonb', { nullable: true })
  items: Array<{ itemId: string; quantity: number }>;

  @CreateDateColumn()
  createdAt: Date;
}
