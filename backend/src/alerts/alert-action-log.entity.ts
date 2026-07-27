import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';
import { AlertActionType } from './alert.entity';

@Entity('alert_action_logs')
export class AlertActionLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  alertId: number;

  @Column()
  userId: number;

  @Column({ type: 'enum', enum: AlertActionType })
  actionChoice: AlertActionType;

  @CreateDateColumn()
  createdAt: Date;
}
