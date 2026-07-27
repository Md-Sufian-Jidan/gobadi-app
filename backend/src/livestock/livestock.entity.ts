import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum LivestockStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('livestock')
export class Livestock {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column('int')
  sellerId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sellerId' })
  seller?: User;

  @Index()
  @Column()
  species: string; // e.g. cattle, goat, sheep, poultry

  @Index()
  @Column()
  breed: string;

  @Column()
  age: string; // e.g. '24 Months'

  @Column('float')
  weight: number; // in Kg

  @Column()
  gender: string; // Male / Female

  @Column('jsonb', { nullable: true })
  vaccinationHistory?: Record<string, any>;

  @Column('jsonb', { nullable: true })
  medicalHistory?: Record<string, any>;

  @Column()
  healthStatus: string; // e.g. Healthy, Recovering

  @Column({ nullable: true })
  pregnancyStatus?: string; // e.g. Pregnant (3 Months), Not Pregnant

  @Column({ nullable: true })
  certification?: string; // URL to document/certificate

  @Column()
  farmName: string;

  @Column()
  location: string; // Division/District

  @Column('text', { array: true, default: '{}' })
  images: string[];

  @Column('text', { array: true, default: '{}' })
  videos: string[];

  @Column('text', { array: true, default: '{}' })
  documents: string[];

  @Column('float')
  price: number;

  @Column({ default: false })
  isNegotiable: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: false })
  isReserved: boolean;

  @Column({ default: false })
  isSold: boolean;

  @Column({ type: 'enum', enum: LivestockStatus, default: LivestockStatus.DRAFT })
  status: LivestockStatus;

  @Column({ default: false })
  isVerified: boolean;

  @DeleteDateColumn()
  deletedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
