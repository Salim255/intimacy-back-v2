import { DataSource } from 'typeorm';
import { Chat } from '../entities/chat.entity';

export class ChatsRepository {
  constructor(private readonly dataSource: DataSource) {}

  async insert(): Promise<Chat> {
    const values = [1];
    const query = `INSERT INTO chats
    (no_read_messages)
    VALUES($1)
    RETURNING * ;
    `;
    const createdChat: Chat[] = await this.dataSource.query(query, values);
    return createdChat[0];
  }

  async resetMessageCounter(chatId: number): Promise<Chat> {
    const values = [chatId, 0];
    const query = `UPDATE chats
    SET no_read_messages = $2
    WHERE id = $1
    RETURNING *;`;
    const updatedChat: Chat[] = await this.dataSource.query(query, values);
    return updatedChat[0];
  }
}
