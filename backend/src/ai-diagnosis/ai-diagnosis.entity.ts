import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('ai_diagnoses')
export class AiDiagnosis {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column('int')
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column('text', { array: true, default: '{}' })
  images: string[];

  @Column('text', { array: true, default: '{}' })
  symptoms: string[];

  @Column('text')
  analysisResult: string;

  @Column('float')
  confidenceScore: number;

  @Column('jsonb', { nullable: true })
  recommendations?: Record<string, any>;

  @Column('int', { array: true, default: '{}' })
  recommendedDoctorIds: number[];

  @Column('int', { nullable: true })
  prescriptionId?: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
