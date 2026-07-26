import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column('int', { nullable: true })
  userId?: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column()
  name: string;

  @Index()
  @Column()
  specialty: string;

  @Column()
  experience: string;

  @Column('float', { default: 4.8 })
  rating: number;

  @Column()
  avatar: string;

  @Column('text')
  bio: string;
}
