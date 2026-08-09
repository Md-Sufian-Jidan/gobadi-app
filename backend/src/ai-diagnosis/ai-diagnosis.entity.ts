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

export enum AiDiagnosisStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  FAILED = 'FAILED',
}

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

  @Column({
    type: 'enum',
    enum: AiDiagnosisStatus,
    default: AiDiagnosisStatus.PENDING,
  })
  status: AiDiagnosisStatus;

  @Column({ nullable: true })
  failureReason?: string;

  @Column('text', { nullable: true })
  analysisResult?: string;

  @Column('float', { nullable: true })
  confidenceScore?: number;

  @Column('text', { array: true, default: '{}' })
  recommendations: string[];

  @Column('int', { array: true, default: '{}' })
  recommendedDoctorIds: number[];

  @Column('int', { nullable: true })
  prescriptionId?: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
