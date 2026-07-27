import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';
import { Livestock } from '../livestock/livestock.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order?: Order;

  @Column('int', { nullable: true })
  productId?: number | null;

  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @Column('int', { nullable: true })
  livestockId?: number | null;

  @ManyToOne(() => Livestock, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'livestockId' })
  livestock?: Livestock;

  @Column('int')
  quantity: number;

  @Column('float')
  price: number; // Price at checkout time

  @Column('float', { default: 0 })
  discount: number; // Discount at checkout time

  @Column()
  name: string; // Snapshot of item name
}
