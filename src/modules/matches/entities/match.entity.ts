import { User } from 'src/modules/users/entities/user.entity';
import {
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum MatchStatus {
  Pending = 1, // Request sent
  Accepted = 2, // Request accepted
}

@Entity('users')
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updated_at: Date;

  @Column({ type: 'integer', name: 'to_user_id' })
  to_user_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'from_user_id' })
  from_user_id: number;
  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.Pending,
    name: 'status',
  })
  status: MatchStatus;
}
