import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('market_items')
export class MarketItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column('int', { nullable: true })
  sellerId?: number | null;

  @Column()
  name: string;

  @Column('float')
  price: number;

  @Index()
  @Column()
  category: string;

  @Column({ nullable: true })
  image?: string;
}
