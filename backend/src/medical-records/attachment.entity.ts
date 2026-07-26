import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AttachmentStatus {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
}

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  patientId: number;

  @Column('int', { nullable: true })
  appointmentId?: number | null;

  @Column()
  uploadedByUserId: number;

  @Column()
  originalFileName: string;

  @Column()
  mimeType: string;

  @Column('int')
  fileSizeBytes: number;

  @Column({ nullable: true })
  storageUrl?: string;

  @Column({ nullable: true })
  storagePublicId?: string;

  @Column({
    type: 'enum',
    enum: AttachmentStatus,
    default: AttachmentStatus.UPLOADED,
  })
  status: AttachmentStatus;

  @Column({ nullable: true })
  failureReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
