import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('market_rates')
export class MarketRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  commodity: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  unit: string;

  @Column('date')
  date: string;

  @Column({ nullable: true })
  region?: string;

  @CreateDateColumn()
  createdAt: Date;
}
