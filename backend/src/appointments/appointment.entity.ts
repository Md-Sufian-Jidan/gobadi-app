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
  @Column('int', { nullable: true })
  clinicId?: number | null;

  @Index()
  @Column('int', { nullable: true })
  serviceId?: number | null;

  @Index()
  @Column()
  patientId: number;

  @Column('timestamptz')
  startAt: Date;

  @Column('timestamptz')
  endAt: Date;

  @Column('int')
  durationMinutes: number;

  @Column('float', { default: 0 })
  price: number;

  @Column({ default: 'pending' })
  paymentStatus: string; // pending, paid, failed, refunded

  @Column({ nullable: true })
  paymentTransactionId?: string;

  @Column('text', { nullable: true })
  prescription?: string; // prescription notes or file URL

  @Column('text', { nullable: true })
  notes?: string;

  @Column('int', { nullable: true })
  followUpId?: number | null;

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
