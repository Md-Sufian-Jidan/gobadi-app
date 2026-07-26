import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('doctor_availability')
@Index(['doctorId', 'dayOfWeek'])
export class Availability {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  doctorId: number;

  /** 0 = Sunday .. 6 = Saturday */
  @Column('int')
  dayOfWeek: number;

  /** 'HH:mm' 24-hour format */
  @Column()
  startTime: string;

  /** 'HH:mm' 24-hour format */
  @Column()
  endTime: string;

  @Column('int', { default: 30 })
  slotDurationMinutes: number;

  @Column('int', { default: 10 })
  bufferMinutes: number;

  @Column({ default: true })
  isActive: boolean;
}
