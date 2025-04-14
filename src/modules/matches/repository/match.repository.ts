import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Match } from '../entities/match.entity';
import { MatchDto } from '../matches-dto/matches-dto';

export type InitiateMatchInput = {
  toUserId: number;
  fromUserId: number;
};

export type AcceptMatchPayload = {
  matchId: number;
  userId: number;
};

@Injectable()
export class MatchRepository {
  constructor(private readonly dataSource: DataSource) {}

  async initiateMatch(data: InitiateMatchInput): Promise<MatchDto> {
    const values = [data.toUserId, data.fromUserId, 1];
    const query = `INSERT INTO matches (to_user_id, from_user_id, status)
    VALUES ($1, $2, $3) RETURNING id, to_user_id, from_user_id, status;`;
    const result: MatchDto[] = await this.dataSource.query(query, values);
    return result[0];
  }

  async fetchMatches(userId: number): Promise<Match[]> {
    const query = `
      SELECT 
        u.id AS partner_id,
        u.first_name,
        u.last_name,
        u.avatar,
        u.connection_status,
        uk.public_key 
        
      FROM users u

      INNER JOIN matches mtc
        ON (
          (mtc.from_user_id = u.id AND mtc.to_user_id = $1)
          OR (mtc.from_user_id = $1 AND mtc.to_user_id = u.id)
        )

      LEFT JOIN user_keys uk ON uk.user_id = u.id

      WHERE mtc.status = 2 AND u.id != $1 AND  NOT EXISTS (
        SELECT 1
        FROM messages msg
        WHERE 
          (
          (msg.from_user_id = u.id AND msg.to_user_id = $1)
          OR (msg.to_user_id = u.id AND msg.from_user_id = $1)
          ) 
    )`;
    const values = [userId];
    const result: Match[] = await this.dataSource.query(query, values);
    return result;
  }

  async acceptMatch(data: AcceptMatchPayload): Promise<Match> {
    console.log(data);
    const query = `
    UPDATE matches
    SET status = 2
    WHERE id = $1 AND to_user_id = $2 RETURNING *;
    `;

    const values = [data.matchId, data.userId];
    const match: Match[] = await this.dataSource.query(query, values);
    return match[0];
  }
}
