import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum VideoSessionStatus {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
}

@Entity('video_sessions')
export class VideoSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  appointmentId: number;

  @Column()
  channelName: string;

  @Column({
    type: 'enum',
    enum: VideoSessionStatus,
    default: VideoSessionStatus.WAITING,
  })
  status: VideoSessionStatus;

  @Column('int', { nullable: true })
  doctorUserId: number | null;

  @Column('int', { nullable: true })
  patientId: number | null;

  @Column('timestamptz', { nullable: true })
  startedAt: Date | null;

  @Column('timestamptz', { nullable: true })
  endedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
