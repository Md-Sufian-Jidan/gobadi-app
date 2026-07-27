import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('brands')
export class Brand {
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
