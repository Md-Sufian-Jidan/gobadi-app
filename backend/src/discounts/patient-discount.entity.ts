import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('patient_discounts')
@Index(['doctorId', 'patientId'], { unique: true })
export class PatientDiscount {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  doctorId: number;

  /** Animal.id */
  @Index()
  @Column()
  patientId: number;

  @Column('float')
  percent: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
