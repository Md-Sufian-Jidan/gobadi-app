import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('fields')
export class Field {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  userId: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  sizeAcres: number;

  @Column({ nullable: true })
  cropType?: string;

  @Column({ nullable: true })
  location?: string;

  @CreateDateColumn()
  createdAt: Date;
}
