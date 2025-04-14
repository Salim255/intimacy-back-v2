import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Chat } from '../../chats/entities/chat.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int' })
  from_user_id: number;

  @Column({ type: 'int' })
  to_user_id: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'sent',
  })
  status: 'sent' | 'delivered' | 'read';

  @Column()
  chat_id: number;

  @ManyToOne(() => Chat, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;
}
