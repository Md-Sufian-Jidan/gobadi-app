import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  RESCHEDULED = 'RESCHEDULED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

@Entity('appointments')
@Index(['doctorId', 'startAt'], {
  unique: true,
  where: "status != 'CANCELLED'",
})
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  doctorId: number;

  @Index()
  @Column()
  patientId: number;

  @Column('timestamptz')
  startAt: Date;

  @Column('timestamptz')
  endAt: Date;

  @Column('int')
  durationMinutes: number;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.CONFIRMED,
  })
  status: AppointmentStatus;

  @Column({ default: false })
  reminder24hSent: boolean;

  @Column({ default: false })
  reminder1hSent: boolean;

  @Column('timestamptz', { nullable: true })
  cancelledAt?: Date | null;

  @Column('int', { nullable: true })
  cancelledByUserId?: number | null;

  @Column('timestamptz', { nullable: true })
  originalStartAt?: Date | null;

  @Column('timestamptz', { nullable: true })
  rescheduledAt?: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
