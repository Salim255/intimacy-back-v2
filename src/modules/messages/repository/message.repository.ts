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
      createMessagePayload.from_user_id,
      createMessagePayload.to_user_id,
      createMessagePayload.chat_id,
      createMessagePayload.partner_connection_status === 'online'
        ? 'delivered'
        : 'sent',
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

  // This code used to update messages in room to read once receiver joined a room
  async markMessagesAsReadFromSender(fromUserId, toUserId) {
    const value = [fromUserId, toUserId];
    const query = `UPDATE messages SET status = 'read'
      WHERE (status = 'delivered' OR  status = 'sent') 
            AND to_user_id = $1 AND from_user_id = $2
      RETURNING *;`;
    const updatedMessages: Message[] = await this.dataSource.query(
      query,
      value,
    );
    return updatedMessages;
  }
  // Here we update messages that were sent to this userId to 'delivered' once they are connected
  async markAllMessagesAsDeliveredForUser(userId: number): Promise<Message[]> {
    const value = [userId];
    const query = `UPDATE messages msg
      SET status = 'delivered'
      WHERE msg.to_user_id = $1 AND status = 'sent'
      RETURNING *;`;
    const updatedMessages: Message[][] = await this.dataSource.query(
      query,
      value,
    );
    return updatedMessages[0];
  }
}
