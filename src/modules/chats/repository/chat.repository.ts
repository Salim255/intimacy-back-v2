import { DataSource } from 'typeorm';
import { Chat } from '../entities/chat.entity';
import { ChatWithDetailsDto } from '../chat-dto/chat-response.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatRepository {
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
    const updatedChat: Chat[][] = await this.dataSource.query(query, values);
    return updatedChat[0][0];
  }

  async incrementMessageCounter(chatId: number): Promise<Chat> {
    const values = [chatId];
    const query = `UPDATE chats
    SET no_read_messages = no_read_messages + 1
    WHERE id = $1
    RETURNING *;`;
    const updatedChat: Chat[][] = await this.dataSource.query(query, values);
    return updatedChat[0][0];
  }

  async getChatById(chatId: number): Promise<Chat> {
    const values = [chatId];
    const query = `SELECT * FROM chats
    WHERE id = $1;`;
    const chat: Chat = await this.dataSource.query(query, values);
    return chat;
  }

  async getAllChatsByUserId(userId: number): Promise<ChatWithDetailsDto[]> {
    const values = [userId];
    const query = `
    SELECT 
      chats.id, 
      chats.type, 
      chats.created_at, 
      chats.updated_at,
      chats.no_read_messages,

       -- Encrypted session key based on sender_id
      CASE 
        WHEN sk.sender_id = $1 THEN sk.encrypted_session_for_sender 
        ELSE sk.encrypted_session_for_receiver 
      END AS encrypted_session_base64,

    -------- Users collection ---------
    ( 
      SELECT jsonb_agg (users_data) 
        FROM (
            SELECT
              u.id AS user_id,
              u.avatar,
              u.last_name,
              u.first_name,
              chat_users.is_admin, 
              u.connection_status
            FROM users AS u
            JOIN chat_users ON chat_users.user_id = u.id AND chat_users.chat_id = cu.chat_id
        ) AS users_data
    ) AS users,
    ------------------End Users collection------------------

    ----------- Message collection -----------
    ( 
      SELECT jsonb_agg (messages )
        FROM 
        (
          SELECT * FROM messages
          WHERE chat_id = cu.chat_id
          ORDER BY created_at ASC 
        ) AS messages
    ) AS messages
    ---------- End message collection ---------

    -------- Main table -------
    FROM chat_users cu
    -----------------------------

    ----------- Join chats table -----
    JOIN chats ON cu.chat_id = chats.id
    ---------- End joining chats table -----

    --------------Join session keys by chat id -------
    LEFT JOIN session_keys sk ON sk.chat_id = chats.id
    --------------End join session keys -----------

    ------- Condition to join
    WHERE cu.user_id = $1
    ORDER BY chats.updated_at
    `;
    const chats: ChatWithDetailsDto[] = await this.dataSource.query(
      query,
      values,
    );
    return chats;
  }

  async getChatDetailsByChatIdUserId(data: {
    userId: number;
    chatId: number;
  }): Promise<ChatWithDetailsDto> {
    const values = [data.userId, data.chatId];
    const query = `
    SELECT
      chats.id,
      chats.type,
      chats.created_at,
      chats.updated_at,
      chats.no_read_messages,
      
      -- Encrypted session key based on sender_id
      CASE 
        WHEN sk.sender_id = $1 THEN sk.encrypted_session_for_sender 
        ELSE sk.encrypted_session_for_receiver 
      END AS encrypted_session_base64,

    ------ Get users in the chat ------
    (
      SELECT jsonb_agg(user_data)
        FROM (
          SELECT 
            u.id AS user_id, 
            u.first_name, 
            u.last_name, 
            u.avatar, 
            u.connection_status,
            cu.is_admin  -- bring the is_admin from chat_users
          FROM chat_users cu
          JOIN users u ON u.id = uc.user_id
          WHERE uc.chat_id = $2
        ) AS user_data
      ) AS users,
 
    ------ End users collection ------- 
  
    ------ Get all message ------
    -- Get all messages in the chat
    (SELECT jsonb_agg(msgs)
     FROM 
       (
        SELECT * FROM messages
        WHERE chat_id = uc.chat_id
        ORDER BY created_at ASC
        ) AS msgs
      ) AS messages
    ------ End messages getter ----------
  
    -----------------------Main table ------
    FROM chat_users uc
    
    ---------------Join chat by chat id-------------
    JOIN chats ON uc.chat_id = chats.id
    ----------------End join chat---------------------

    --------------Join session keys by chat id -------
    LEFT JOIN session_keys sk ON sk.chat_id = chats.id
    --------------End join session keys -----------

    WHERE uc.user_id = $1 AND chats.id = $2
    `;
    const chat: ChatWithDetailsDto[] = await this.dataSource.query(
      query,
      values,
    );
    return chat[0];
  }

  async getChatByUsersIds(userId1: number, userId2: number): Promise<Chat> {
    const values = [userId1, userId2];
    const query = `
        SELECT 
        c.*,

        -- Encrypted session key based on sender_id
        CASE 
            WHEN sk.sender_id = $1 THEN sk.encrypted_session_for_sender 
            ELSE sk.encrypted_session_for_receiver 
        END AS encrypted_session_base64,

        -----------------Users collection------------------------
        ( SELECT jsonb_agg(users) FROM (
            SELECT u.id AS user_id, u.avatar, u.last_name , u.first_name , u.connection_status FROM users u
                WHERE u.id IN (
                SELECT uc.user_id FROM chat_users uc
                    WHERE uc.chat_id = c.id)
                    ) AS users
                ) AS users ,
        ------------------End Users collection-------------------

        ----------------Messages collection-------------------
        ( SELECT jsonb_agg(messages) FROM (
            SELECT * FROM messages ms
            WHERE ms.chat_id = c.id
            ORDER BY created_at ASC
        ) AS messages ) AS messages
        ----------------END Messages collection--------------------------

        --------------------Main table chat-----------------------
        FROM chats c
        ----------------------------------------------

        --------------------Joining chat_users table----------------------
        JOIN (
            SELECT chat_id
            FROM chat_users
            WHERE user_id IN ($1, $2)
            GROUP BY chat_id
            HAVING COUNT(DISTINCT user_id) = 2
        ) AS cu ON c.id = cu.chat_id
        ------------------ End joining chat_users -------
        
        --------------Join session keys by chat id -------
        LEFT JOIN session_keys sk ON sk.chat_id = c.id
        --------------End join session keys -----------
        `;
    const chat: Chat[] = await this.dataSource.query(query, values);
    return chat[0];
  }
}
