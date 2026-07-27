import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column('int')
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column()
  label: string; // e.g. Home, Farm, Office, Clinic

  @Column()
  contactName: string;

  @Column()
  phone: string;

  @Column()
  division: string;

  @Column()
  district: string;

  @Column()
  upazila: string;

  @Column()
  postalCode: string;

  @Column('float', { nullable: true })
  latitude?: number;

  @Column('float', { nullable: true })
  longitude?: number;

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
