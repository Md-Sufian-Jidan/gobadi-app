import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('animals')
export class Animal {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ nullable: true })
  userId?: number;

  @Index()
  @Column()
  name: string;

  @Index()
  @Column()
  breed: string;

  @Column()
  weight: string;

  @Column()
  age: string;

  @Column()
  color: string;

  @Column({ nullable: true })
  image?: string;
}
