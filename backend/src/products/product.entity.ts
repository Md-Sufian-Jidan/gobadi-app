import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Brand } from './brand.entity';

export enum ProductStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  sku: string;

  @Index()
  @Column({ nullable: true })
  barcode?: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('float')
  price: number;

  @Column('float', { default: 0 })
  discount: number;

  @Column('int', { nullable: true })
  brandId?: number | null;

  @ManyToOne(() => Brand, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'brandId' })
  brand?: Brand;

  @Column('int', { nullable: true })
  categoryId?: number | null;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category?: Category;

  @Column('jsonb', { nullable: true })
  specifications?: Record<string, any>;

  @Column('text', { nullable: true })
  instructions?: string;

  @Column('text', { array: true, default: '{}' })
  images: string[];

  @Column('text', { array: true, default: '{}' })
  videos: string[];

  @Column('text', { array: true, default: '{}' })
  documents: string[];

  @Column({ nullable: true })
  seoTitle?: string;

  @Column({ nullable: true })
  seoDescription?: string;

  @Column({ nullable: true })
  seoKeywords?: string;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.DRAFT })
  status: ProductStatus;

  @Column({ default: true })
  visibility: boolean;

  @Column({ default: false })
  isPrescriptionRequired: boolean;

  @DeleteDateColumn()
  deletedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
