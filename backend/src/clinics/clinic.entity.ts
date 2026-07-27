import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Doctor } from '../doctors/doctor.entity';

@Entity('clinics')
export class Clinic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  userId: number; // Owner / manager user

  @Column()
  name: string;

  @Column()
  location: string;

  @Column('jsonb', { nullable: true })
  businessHours?: Record<string, any>;

  @Column({ default: false })
  isVerified: boolean;

  @Column('float', { default: 5.0 })
  rating: number;

  @Column({ nullable: true })
  avatar?: string;

  @Column('text')
  description: string;

  @ManyToMany(() => Doctor, { cascade: true })
  @JoinTable({
    name: 'clinic_doctors',
    joinColumn: { name: 'clinicId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'doctorId', referencedColumnName: 'id' },
  })
  doctors: Doctor[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
