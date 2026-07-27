import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

export enum InventoryMovementType {
  ADDITION = 'addition',
  RESERVATION = 'reservation',
  SALE = 'sale',
  RETURN = 'return',
  ADJUSTMENT = 'adjustment',
}

@Entity('inventory_ledger')
export class InventoryLedger {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column('int')
  productId: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @Column({
    type: 'enum',
    enum: InventoryMovementType,
  })
  movementType: InventoryMovementType;

  @Column('int')
  quantity: number; // Positive for additions/returns/positive adjustments, negative for reservations/sales/negative adjustments

  @Column({ nullable: true })
  batchNumber?: string;

  @Column('date', { nullable: true })
  expiryDate?: Date;

  @Column({ nullable: true })
  referenceId?: string; // e.g. Order ID, Admin Adjustment ID

  @CreateDateColumn()
  createdAt: Date;
}
