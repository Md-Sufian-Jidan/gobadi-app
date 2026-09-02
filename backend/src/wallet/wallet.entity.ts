import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  userId: number;

  @Column('float', { default: 0 })
  balance: number;

  @Column('int', { default: 0 })
  coins: number;
}
