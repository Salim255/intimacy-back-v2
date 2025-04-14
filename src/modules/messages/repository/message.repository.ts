import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Message } from '../entities/message.entity';
import { CreateMessagePayload } from '../services/message.service';

@Injectable()
export class MessageRepository {
  constructor(private readonly dataSource: DataSource) {}

  async insert(createMessagePayload: CreateMessagePayload): Promise<Message> {
    const values = [
      createMessagePayload.content,
      createMessagePayload.fromUserId,
      createMessagePayload.toUserId,
      createMessagePayload.chatId,
      createMessagePayload.status,
    ];
    const query = `INSERT INTO 
    messages (content, from_user_id, to_user_id , chat_id, status)
    VALUES
    ($1, $2, $3, $4, $5) RETURNING *;`;

    const createdMessage: Message[] = await this.dataSource.query(
      query,
      values,
    );
    return createdMessage[0];
  }
}
