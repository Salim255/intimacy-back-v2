import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ChatUser } from '../entities/chat-user.entity';

export type CreateChatUserPayload = {
  userId: number;
  chatId: number;
  isAdmin: boolean;
};
@Injectable()
export class ChatUserRepository {
  constructor(private readonly datSource: DataSource) {}

  async insert(
    createChatUserPayload: CreateChatUserPayload,
  ): Promise<ChatUser> {
    const values = [
      createChatUserPayload.userId,
      createChatUserPayload.chatId,
      createChatUserPayload.isAdmin ?? false,
    ];
    const query = `INSERT INTO chat_users(user_id, chat_id, is_admin)
    VALUES ($1, $2, $3) RETURNING *;`;
    const createdChatUser: ChatUser[] = await this.datSource.query(
      query,
      values,
    );
    return createdChatUser[0];
  }
}
