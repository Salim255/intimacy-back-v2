import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Chat } from '../../chats/entities/chat.entity';

@Entity('session_keys')
export class SessionKeys {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chat_id: number;

  @Column()
  sender_id: number;

  @Column()
  receiver_id: number;

  @Column('text')
  encrypted_session_for_sender: string;

  @Column('text')
  encrypted_session_for_receiver: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToOne(() => Chat, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;
}
