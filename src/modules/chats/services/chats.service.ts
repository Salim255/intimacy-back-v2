import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  ChatRepository,
  UpdateChatMessagesToRead,
} from '../repository/chat.repository';
import { Chat } from '../entities/chat.entity';
import { ChatWithDetailsDto } from '../chat-dto/chat-response.dto';
import { MessageService } from '../../messages/services/message.service';
import { ChatUsersService } from '../../chat-users/services/chat-users.service';
import { SessionKaysService } from '../../session-keys/services/session-kays.service';
import { DataSource } from 'typeorm';
import { PartnerConnectionStatus } from 'src/modules/messages/message-dto/message-dto';
import { Message } from 'src/modules/messages/entities/message.entity';

export type CreateChatPayload = {
  content: string;
  from_user_id: number;
  to_user_id: number;
  session_key_sender: string;
  session_key_receiver: string;
  partner_connection_status: PartnerConnectionStatus;
};
@Injectable()
export class ChatsService {
  constructor(
    private readonly chatsRepository: ChatRepository,
    private readonly chatUsersService: ChatUsersService,
    private readonly messageService: MessageService,
    private readonly dataSource: DataSource,
    private readonly sessionKaysService: SessionKaysService,
  ) {}

  async createFullChat(
    createChatPayload: CreateChatPayload,
  ): Promise<ChatWithDetailsDto> {
    const queryRunning = this.dataSource.createQueryRunner();
    await queryRunning.connect();
    await queryRunning.startTransaction();
    try {
      // Step: 1 - Create the chat
      const createdChat: Chat = await this.chatsRepository.insert();

      // Step: 2 - Create session keys
      await this.sessionKaysService.createSessionKeys({
        chat_id: createdChat.id,
        sender_id: createChatPayload.from_user_id,
        receiver_id: createChatPayload.to_user_id,
        encrypted_session_for_receiver: createChatPayload.session_key_receiver,
        encrypted_session_for_sender: createChatPayload.session_key_sender,
      });

      // Step: 3 - Create the users in the chat
      await Promise.all(
        [createChatPayload.from_user_id, createChatPayload.to_user_id].map(
          (userId) => {
            return this.chatUsersService.addUserToChat({
              userId,
              chatId: createdChat.id,
              isAdmin: userId === createChatPayload.from_user_id,
            });
          },
        ),
      );

      // Step: 4 - Create the message
      await this.messageService.createMessage({
        content: createChatPayload.content,
        from_user_id: createChatPayload.from_user_id,
        to_user_id: createChatPayload.to_user_id,
        chat_id: createdChat.id,
        partner_connection_status: createChatPayload.partner_connection_status,
      });

      // Step: 5 - Return the created chat
      const fetchChatPayload = {
        chatId: createdChat.id,
        userId: createChatPayload.from_user_id,
      };

      // Fetch the chat with details
      const chatWithDetails =
        await this.chatsRepository.getChatDetailsByChatIdUserId({
          ...fetchChatPayload,
        });

      // - Commit the transaction
      await queryRunning.commitTransaction();

      return chatWithDetails;
    } catch (error) {
      // Rollback the transaction in case of error
      await queryRunning.rollbackTransaction();
      const messageError =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error creating chat: ' + messageError,
          code: 'CHAT_CREATION_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      // Release the query runner
      await queryRunning.release();
    }
  }

  async getAllChatsByUserId(userId: number): Promise<ChatWithDetailsDto[]> {
    try {
      const chats: ChatWithDetailsDto[] =
        await this.chatsRepository.getAllChatsByUserId(userId);
      return chats;
    } catch (error) {
      console.error('Error fetching chats:', error);
      const messageError =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error getting all chats by user ID: ' + messageError,
          code: 'GETTING_ALL_CHATS_USERID_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async fetchChatByChatIdUserId(
    chatId: number,
    userId: number,
  ): Promise<ChatWithDetailsDto> {
    try {
      const chat: ChatWithDetailsDto =
        await this.chatsRepository.getChatDetailsByChatIdUserId({
          chatId,
          userId,
        });
      return chat;
    } catch (error) {
      console.error('Error fetching chats:', error);
      const messageError =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error getting  chat by user chat id: ' + messageError,
          code: 'GETTING_CHAT__ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateChatMessagesToRead(
    updateChatMessagePayload: UpdateChatMessagesToRead,
  ): Promise<Message[]> {
    try {
      const messages: Message[] =
        await this.chatsRepository.updateChatMessagesToRead(
          updateChatMessagePayload,
        );
      return messages;
    } catch (error) {
      console.error('Error updating chat messages:', error);
      const messageError =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error in update chat messages to read: ' + messageError,
          code: 'UPDATING_CHAT_MESSAGES_TO_READ__ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
