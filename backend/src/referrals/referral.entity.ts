import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

export enum PayoutStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  PAID = 'PAID',
}

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  userId: number;

  @Index({ unique: true })
  @Column()
  referralCode: string;

  @Column('float', { default: 0 })
  totalEarned: number;

  @Column('float', { default: 0 })
  pendingAmount: number;

  @Column({ type: 'enum', enum: PayoutStatus, default: PayoutStatus.NONE })
  payoutStatus: PayoutStatus;

  @Column('int', { default: 0 })
  referralCount: number;

  @Column({ nullable: true })
  redeemedReferralCode?: string;

  @CreateDateColumn()
  createdAt: Date;
}
