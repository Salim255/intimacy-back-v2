import {
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ type: 'varchar', length: 50, unique: true })
  email: string;

  @Column('text')
  password: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'offline',
    enum: ['offline', 'online', 'away'],
  })
  connection_status: string;
}
