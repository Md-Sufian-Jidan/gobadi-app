import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('admin_refresh_tokens')
export class AdminRefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  adminId: number;

  @Index({ unique: true })
  @Column()
  tokenHash: string;

  @Column('timestamptz')
  expiresAt: Date;

  @Column('timestamptz', { nullable: true })
  revokedAt?: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
