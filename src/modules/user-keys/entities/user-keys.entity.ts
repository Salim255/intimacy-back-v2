import { User } from '../../users/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('user-keys')
export class UserKeys {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column('text')
  public_key: string;

  @Column('text')
  encrypted_private_key: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) // This sets the foreign key relationship with the User table
  user: User;
}
