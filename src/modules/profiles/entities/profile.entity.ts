import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}
export enum InterestedIn {
  Men = 'men',
  Women = 'women',
  Both = 'both',
}

export enum LookingFor {
  Chat = 'chat',
  Friendship = 'friendship',
  Casual = 'casual',
  LongTerm = 'long_term',
}

@Entity('profile')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'date', name: 'birth_date' })
  birth_date: Date;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({ length: 100 })
  country: string;

  @Column({ length: 100 })
  city: string;

  @Column({
    type: 'enum',
    enum: InterestedIn,
  })
  interested_in: InterestedIn;

  @Column('simple-array', { nullable: false })
  photos: string[];

  @Column({
    type: 'enum',
    enum: LookingFor,
    array: true,
    nullable: true,
  })
  looking_for: LookingFor[];

  @Column({ type: 'text' })
  bio: string;

  @Column({ type: 'int', nullable: true })
  height: string;

  @Column({ type: 'boolean', default: false })
  children: boolean;

  @Column({ length: 100, nullable: true })
  education: string;

  @Column({ type: 'double precision', nullable: true })
  latitude: number;

  @Column({ type: 'double precision', nullable: true })
  longitude: number;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
