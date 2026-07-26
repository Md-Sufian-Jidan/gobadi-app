import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('conversations')
@Index(['doctorId', 'patientId'], { unique: true })
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  doctorId: number;

  @Column('int', { nullable: true })
  doctorUserId?: number | null;

  @Index()
  @Column()
  patientId: number;

  @Column('int', { nullable: true })
  appointmentId?: number | null;

  @Column('timestamptz', { nullable: true })
  lastMessageAt?: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
