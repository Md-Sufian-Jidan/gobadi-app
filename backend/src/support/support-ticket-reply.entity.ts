import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('support_ticket_replies')
export class SupportTicketReply {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  ticketId: number;

  @Index()
  @Column()
  authorId: number;

  @Column('text')
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}
