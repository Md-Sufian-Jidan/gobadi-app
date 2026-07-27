import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProviderType {
  DOCTOR = 'doctor',
  CLINIC = 'clinic',
  AI = 'ai',
}

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ProviderType,
  })
  providerType: ProviderType;

  @Index()
  @Column('int')
  providerId: number; // Doctor ID, Clinic ID, or mock AI ID

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('int')
  durationMinutes: number;

  @Column('float')
  price: number;

  @Column('text', { nullable: true })
  preparationInstructions?: string;

  @Column('text', { nullable: true })
  requirements?: string;

  @Column({ default: true })
  isOnline: boolean;

  @Column({ default: false })
  isOffline: boolean;

  @Column({ nullable: true })
  location?: string; // Clinic Address if offline

  @Column('text', { nullable: true })
  cancellationPolicy?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isRecurring: boolean; // For future health packages / recurring medicine deliveries

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
