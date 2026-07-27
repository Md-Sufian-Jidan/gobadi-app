import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { Livestock } from '../livestock/livestock.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column('int')
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column('int', { nullable: true })
  productId?: number | null;

  @ManyToOne(() => Product, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @Column('int', { nullable: true })
  livestockId?: number | null;

  @ManyToOne(() => Livestock, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'livestockId' })
  livestock?: Livestock;

  @Column('int', { default: 1 })
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;
}
