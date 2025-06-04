import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PotentialMatch } from '../matches-dto/matches-dto';
import { Match } from '../entities/match.entity';

export type InitiateMatchInput = {
  toUserId: number;
  fromUserId: number;
};

export type AcceptMatchPayload = {
  matchId: number;
  userId: number;
};

export enum ConnectionStatus {
  Online = 'online',
  Offline = 'offline',
  Away = 'away',
}
export type MatchDetails = {
  partner_id: number;
  profile_id: number;
  name: string;
  birth_date: Date;
  city: string;
  country: string;
  photos: string[];
  connection_status: ConnectionStatus; // assuming status types
  public_key: string;
  match_id: number;
  match_status: 1 | 2; // assuming status types
  match_created_at: Date; // or `Date` if you're using Date objects
  match_updated_at: Date; // or `Date`
};

@Injectable()
export class MatchRepository {
  constructor(private readonly dataSource: DataSource) {}

  async initiateMatch(data: InitiateMatchInput): Promise<MatchDetails> {
    const values = [data.toUserId, data.fromUserId, 1];
    const query = `INSERT INTO matches (to_user_id, from_user_id, status)
    VALUES ($1, $2, $3) RETURNING id, to_user_id, from_user_id, status;`;
    const result: MatchDetails[] = await this.dataSource.query(query, values);
    return result[0];
  }

  async fetchMatches(userId: number): Promise<MatchDetails[]> {
    try {
      const query = `
        SELECT 
          u.id AS partner_id,
          u.connection_status,
          uk.public_key,
          mtc.id AS match_id,
          mtc.status AS match_status,
          mtc.created_at AS match_created_at,
          mtc.updated_at AS match_updated_at,
          
          pr.id AS profile_id,
          pr.name,
          pr.photos,
          pr.birth_date,
          pr.city,
          pr.country

        FROM users u

        INNER JOIN matches mtc
          ON (
            (mtc.from_user_id = u.id AND mtc.to_user_id = $1)
            OR (mtc.from_user_id = $1 AND mtc.to_user_id = u.id)
          )

        LEFT JOIN user_keys uk ON uk.user_id = u.id

        LEFT JOIN profiles AS pr
          ON pr.user_id = u.id

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
      const result: MatchDetails[] = await this.dataSource.query(query, values);
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

  async acceptMatch(data: AcceptMatchPayload): Promise<MatchDetails> {
    const query = `
    WITH updated_match AS ( UPDATE matches
    SET status = 2
    WHERE id = $1 AND to_user_id = $2 RETURNING * )


    SELECT 
      u.id AS partner_id,
      pr.id AS profile_id,
      pr.name,
      pr.photos,
      pr.birth_date,
      pr.city,
      pr.country,
      u.connection_status,
      uk.public_key,
      um.id AS match_id,
      um.status AS match_status,
      um.created_at AS match_created_at,
      um.updated_at AS match_updated_at

    FROM updated_match um

    JOIN users u 
    ON u.id = um.from_user_id   -- get the partner info

    LEFT JOIN profiles AS pr
          ON pr.user_id = u.id

    LEFT JOIN user_keys uk 

    ON uk.user_id = u.id ;
    `;

    const values = [data.matchId, data.userId];
    const match: MatchDetails[] = await this.dataSource.query(query, values);
    return match[0];
  }

  async findAvailableForMatch(userId: number): Promise<PotentialMatch[]> {
    const query = `SELECT 
        us.id AS user_id,
        us.connection_status,
        ms.status AS match_status,
        ms.id AS match_id,

        pr.id AS profile_id,
        pr.name,
        pr.latitude,
        pr.longitude,
        pr.education,
        pr.children,
        pr.bio,
        pr.gender,
        pr.photos,
        pr.birth_date,
        pr.city,
        pr.country
        
  
      FROM users AS us
  
      LEFT JOIN matches AS ms 
        ON ms.to_user_id = $1 AND ms.from_user_id = us.id
      
      LEFT JOIN profiles AS pr
        ON pr.user_id = us.id
      
      WHERE us.id <> $1
        AND NOT EXISTS (
          SELECT 1 FROM matches m
          WHERE m.from_user_id = $1 
          AND m.to_user_id = us.id
        )
        AND (ms.status IS NULL OR ms.status <> 2);
      `;
    const result: PotentialMatch[] = await this.dataSource.query(query, [
      userId,
    ]);
    return result;
  }

  async fetchMatchByUsers(userId1: number, userId2: number): Promise<Match> {
    const query = `SELECT * FROM matches AS mtc
    WHERE 
      (mtc.from_user_id = $1 AND mtc.to_user_id = $2)
      OR (mtc.from_user_id = $2 AND mtc.to_user_id = $1)
    `;
    const match: Match[] = await this.dataSource.query(query, [
      userId1,
      userId2,
    ]);
    return match[0];
  }
}
