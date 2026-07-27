import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { UserRole } from '../users/user.entity';

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
}

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  conversationId: number;

  @Index()
  @Column()
  senderId: number;

  @Column({ type: 'enum', enum: UserRole })
  senderRole: UserRole;

  @Column('text')
  text: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'enum', enum: MessageStatus, default: MessageStatus.SENT })
  status: MessageStatus;

  @Column('timestamptz', { nullable: true })
  deliveredAt?: Date | null;

  @Column('timestamptz', { nullable: true })
  readAt?: Date | null;

  @Column('varchar', { nullable: true })
  attachmentUrl?: string | null;

  @Column({ type: 'enum', enum: ['image', 'document'], nullable: true })
  attachmentType?: 'image' | 'document' | null;

  @Column('varchar', { nullable: true })
  attachmentMimeType?: string | null;
}
