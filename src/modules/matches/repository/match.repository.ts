import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

export type PartnerMatchDetails = {
  partner_id: number;
  first_name: string;
  last_name: string;
  avatar: string | null;
  connection_status: 'online' | 'offline' | 'away'; // assuming status types
  public_key: string;
  match_id: number;
  match_status: 1 | 2; // assuming status types
  match_created_at: Date; // or `Date` if you're using Date objects
  match_updated_at: Date; // or `Date`
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

  async fetchMatches(userId: number): Promise<PartnerMatchDetails[]> {
    try {
      const query = `
        SELECT 
          u.id AS partner_id,
          u.first_name,
          u.last_name,
          u.avatar,
          u.connection_status,
          uk.public_key,
          mtc.id AS match_id,
          mtc.status AS match_status,
          mtc.created_at AS match_created_at,
          mtc.updated_at AS match_updated_at
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
      const result: PartnerMatchDetails[] = await this.dataSource.query(
        query,
        values,
      );
      return result;
    } catch (error) {
      console.error('Error fetching matches:', error);
      const errorMessage = error instanceof Error ? error.message : '';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Cannot fetch matches: ' + errorMessage,
          code: 'MATCHES_FETCH_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async acceptMatch(data: AcceptMatchPayload): Promise<Match> {
    const query = `
    UPDATE matches
    SET status = 2
    WHERE id = $1 AND to_user_id = $2 RETURNING *;
    `;

    const values = [data.matchId, data.userId];
    const match: Match[][] = await this.dataSource.query(query, values);
    return match[0][0];
  }
}
