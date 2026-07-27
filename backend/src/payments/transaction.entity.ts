import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  REFUNDED = 'refunded',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ nullable: true })
  orderId?: string;

  @Index()
  @Column('int', { nullable: true })
  bookingId?: number;

  @Index()
  @Column('int')
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column('float')
  amount: number;

  @Column()
  provider: string; // bkash, nagad, stripe, sslcommerz, rocket, paypal, simulate

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  gatewayTransactionId?: string;

  @Column('jsonb', { nullable: true })
  gatewayMetadata?: Record<string, any>;

  @Column({ nullable: true })
  redirectUrl?: string;

  @Column({ nullable: true })
  callbackUrl?: string;

  @Column('jsonb', { default: '[]' })
  auditTrail: Array<{
    status: PaymentStatus;
    timestamp: Date;
    message?: string;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
