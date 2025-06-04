import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  CreatedSessionResponseDto,
  CreateSessionDto,
} from '../session-keys-dto/session-key-dto';

@Injectable()
export class SessionKeysRepository {
  constructor(private readonly dataSource: DataSource) {}

  async insert(
    createSessionPayload: CreateSessionDto,
  ): Promise<CreatedSessionResponseDto> {
    const query = `INSERT INTO 
    session_keys (
        chat_id, 
        sender_id,
        receiver_id, 
        encrypted_session_for_sender, 
        encrypted_session_for_receiver 
    )
    VALUES( $1, $2, $3, $4, $5 ) RETURNING *;`;

    const values = [
      createSessionPayload.chat_id,
      createSessionPayload.sender_id,
      createSessionPayload.receiver_id,
      createSessionPayload.encrypted_session_for_sender,
      createSessionPayload.encrypted_session_for_receiver,
    ];
    const createSession: CreatedSessionResponseDto[] =
      await this.dataSource.query(query, values);
    return createSession[0];
  }
}
