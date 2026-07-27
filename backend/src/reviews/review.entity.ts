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

export enum ReviewTargetType {
  PRODUCT = 'product',
  LIVESTOCK = 'livestock',
  DOCTOR = 'doctor',
  CLINIC = 'clinic',
  SERVICE = 'service',
}

@Entity('reviews')
@Index(['targetType', 'targetId', 'isApproved'])
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column('int')
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({
    type: 'enum',
    enum: ReviewTargetType,
  })
  targetType: ReviewTargetType;

  @Column()
  targetId: string; // Target ID (e.g. productId, doctorId, etc.)

  @Column('int')
  rating: number; // 1 to 5 stars

  @Column('text')
  text: string;

  @Column('text', { array: true, default: '{}' })
  images: string[];

  @Column('text', { array: true, default: '{}' })
  videos: string[];

  @Column('text', { nullable: true })
  reply?: string; // Reply from the vendor/provider

  @Column('int', { default: 0 })
  helpfulCount: number;

  @Column({ default: false })
  isReported: boolean;

  @Column({ default: true })
  isApproved: boolean;

  @Column({ default: false })
  isVerified: boolean; // Verified purchase or booking

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
