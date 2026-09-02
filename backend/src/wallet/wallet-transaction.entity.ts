import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  walletId: number;

  /** Signed: negative = deduction, positive = credit/refund */
  @Column('float')
  amount: number;

  @Column()
  reason: string;

  @Column({ nullable: true })
  referenceType?: string;

  @Column({ nullable: true })
  referenceId?: string;

  @CreateDateColumn()
  createdAt: Date;
}
