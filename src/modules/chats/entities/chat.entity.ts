import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 25, default: 'dual' })
  type: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: string;
}
