import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ChatUser } from '../entities/chat-user.entity';

export type CreateChatUserPayload = {
  userId: number;
  chatId: number;
};
@Injectable()
export class ChatUserRepository {
  constructor(private readonly datSource: DataSource) {}

  async insert(
    createChatUserPayload: CreateChatUserPayload,
  ): Promise<ChatUser> {
    const values = [createChatUserPayload.userId, createChatUserPayload.chatId];
    const query = `INSERT INTO user_chats(user_id, chat_id)
    VALUES ($1, $2) RETURNING *;`;
    const createdChatUser: ChatUser[] = await this.datSource.query(
      query,
      values,
    );
    return createdChatUser[0];
  }
}
