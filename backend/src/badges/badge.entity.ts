import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  icon?: string;

  @Column('jsonb')
  criteria: { type: string; threshold: number };

  @CreateDateColumn()
  createdAt: Date;
}
