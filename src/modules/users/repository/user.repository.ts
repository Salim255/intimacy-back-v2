import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DiscoverDto } from '../user-dto/discover-users-dto';

export type InsertUserPayload = {
  email: string;
  password: string;
};
export type UserWithKeys = User & {
  id: number;
  email: string;
  password: string;
  encrypted_private_key: string;
  public_key: string;
};

@Injectable()
export class UserRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async insert(data: InsertUserPayload): Promise<User> {
    //const ds = this.dataSource; // inject it
    const query = `
      INSERT INTO users (email, password)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const values = [data.email, data.password];
    const result: User[] = await this.dataSource.query(query, values);
    return result[0];
  }

  async getUserById(userId: number): Promise<User> {
    const query = `SELECT * FROM users WHERE id = $1;`;
    const result: User[] = await this.dataSource.query(query, [userId]);
    return result[0];
  }

  // Get user by email
  // This method retrieves a user from the database based on their email address.
  // to use in the login process
  async getUser(email: string): Promise<UserWithKeys> {
    const query = `
      SELECT 
        u.id, 
        u.email,
        u.password,
        uk.encrypted_private_key, 
        uk.public_key
      FROM users u
      LEFT JOIN user_keys uk ON uk.user_id = u.id
      WHERE u.email = $1;
    `;
    const result: UserWithKeys[] = await this.dataSource.query(query, [email]);
    return result[0];
  }

  async count(): Promise<number> {
    const query = `SELECT COUNT(*) FROM users;`;
    const result: { count: string }[] = await this.dataSource.query(query);
    return parseInt(result[0].count, 10);
  }

  async disableUser(userId: number): Promise<User> {
    const query = `
      UPDATE users 
      SET is_active = FALSE 
      WHERE id = $1 
      RETURNING *;
    `;
    const result: User[] = await this.dataSource.query(query, [userId]);
    return result[0];
  }

  async updateUser(query: string, values: any[]): Promise<User> {
    const result: User[][] = await this.dataSource.query(query, values);
    return result[0][0];
  }

  async updateUserConnectionStatus(
    userId: number,
    connectionStatus: string,
  ): Promise<User> {
    const query = `
      UPDATE users 
      SET connection_status = $1 
      WHERE id = $2 
      RETURNING *;
    `;
    const result: User[][] = await this.dataSource.query(query, [
      connectionStatus,
      userId,
    ]);
    return result[0][0];
  }

  async deleteUser(userId: number): Promise<User> {
    const query = `DELETE FROM users WHERE id = $1 RETURNING *;`;
    const result: User[] = await this.dataSource.query(query, [userId]);
    return result[0];
  }

  async findAvailableForMatch(userId: number): Promise<DiscoverDto[]> {
    const query = `SELECT 
      us.id,
      us.first_name,
      us.last_name,
      us.avatar,
      us.connection_status,
      ms.status AS match_status,
      ms.id AS match_id

    FROM users AS us

    LEFT JOIN matches AS ms 
      ON ms.to_user_id = $1 AND ms.from_user_id = us.id
    
    WHERE us.id <> $1
      AND NOT EXISTS (
        SELECT 1 FROM matches m
        WHERE m.from_user_id = $1 
        AND m.to_user_id = us.id
      )
      AND (ms.status IS NULL OR ms.status <> 2);
    `;
    const result: DiscoverDto[] = await this.dataSource.query(query, [userId]);
    return result;
  }
}
