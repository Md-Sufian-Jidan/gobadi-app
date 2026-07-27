import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  name: string;

  @Index({ unique: true })
  @Column()
  slug: string;

  @Column({ nullable: true })
  description?: string;
}
