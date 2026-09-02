import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

export enum TimeOffReason {
  VACATION = 'vacation',
  SICK_LEAVE = 'sick_leave',
  CONFERENCE_TRAINING = 'conference_training',
  EMERGENCY = 'emergency',
  OTHER = 'other',
}

@Entity('doctor_time_off')
export class DoctorTimeOff {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  doctorId: number;

  @Column('date')
  startDate: string;

  @Column('date')
  endDate: string;

  @Column({ type: 'enum', enum: TimeOffReason })
  reason: TimeOffReason;

  @Column('text', { nullable: true })
  note?: string;

  @CreateDateColumn()
  createdAt: Date;
}
