import { Injectable } from '@nestjs/common';
import pool from '../config/pool';
import { QueryResult } from 'pg'; // Import pg's QueryResult
import { User } from './entities/user.entity';

export type UserWithKeys = User & {
  private_key: string;
  public_key: string;
};

@Injectable()
export class UserRepository {
  constructor() {}

  async insert(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    isStaff: boolean;
  }): Promise<User> {
    const query = `
      INSERT INTO users (first_name, last_name, email, password, is_staff)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      data.firstName,
      data.lastName,
      data.email,
      data.password,
      data.isStaff,
    ];

    const { rows } = (await pool.query(query, values)) as QueryResult<User>;
    return rows[0];
  }

  static async getUserById(userId: number): Promise<User> {
    const query = `SELECT * FROM users WHERE id = $1;`;
    const { rows } = (await pool.query(query, [userId])) as QueryResult<User>;
    return rows[0];
  }

  static async getUser(email: string): Promise<UserWithKeys> {
    const query = `
      SELECT 
        u.*, 
        uk.encrypted_private_key, 
        uk.public_key
      FROM users u
      LEFT JOIN user_keys uk ON uk.user_id = u.id
      WHERE u.email = $1;
    `;
    const { rows } = (await pool.query(query, [
      email,
    ])) as QueryResult<UserWithKeys>;
    return rows[0];
  }

  static async count(): Promise<number> {
    const query = `SELECT COUNT(*) FROM users;`;
    const { rows } = (await pool.query(query)) as QueryResult<{
      count: string;
    }>;
    return parseInt(rows[0].count, 10);
  }

  async disableUser(userId: number): Promise<User> {
    const query = `
      UPDATE users 
      SET is_active = FALSE 
      WHERE id = $1 
      RETURNING *;
    `;
    const { rows } = (await pool.query(query, [userId])) as QueryResult<User>;
    return rows[0];
  }

  static async updateUser(query: string, values: any[]): Promise<User> {
    const { rows } = (await pool.query(query, values)) as QueryResult<User>;
    return rows[0] || null;
  }

  static async updateUserConnectionStatus(
    userId: number,
    connectionStatus: string,
  ): Promise<User> {
    const query = `
      UPDATE users 
      SET connection_status = $1 
      WHERE id = $2 
      RETURNING id AS user_id, first_name, last_name, avatar, connection_status;
    `;
    const { rows } = (await pool.query(query, [
      connectionStatus,
      userId,
    ])) as QueryResult<User>;
    return rows[0];
  }

  static async deleteUser(userId: number): Promise<User> {
    const query = `DELETE FROM users WHERE id = $1 RETURNING *;`;
    const { rows } = (await pool.query(query, [userId])) as QueryResult<User>;
    return rows[0];
  }

  create() {
    return 1;
  }
}
