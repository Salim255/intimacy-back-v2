import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChatRepository } from '../repository/chat.repository';
import { Chat } from '../entities/chat.entity';
import { ChatWithDetailsDto } from '../chat-dto/chat-response.dto';
import { MessageService } from 'src/modules/messages/services/message.service';
import { ChatUsersService } from '../../chat-users/services/chat-users.service';
import { DataSource } from 'typeorm';
import { ChatUser } from 'src/modules/chat-users/entities/chat-user.entity';

type CreateChatPayload = {
  content: string;
  from_user_id: number;
  to_user_id: number;
  session_key_sender: string;
  session_key_receiver: string;
};

@Injectable()
export class ChatsService {
  constructor(
    private readonly chatsRepository: ChatRepository,
    private readonly chatUsersService: ChatUsersService,
    private readonly messageService: MessageService,
    private readonly dataSource: DataSource,
  ) {}

  async createFullChat(
    createChatPayload: CreateChatPayload,
  ): Promise<ChatWithDetailsDto> {
    const queryRunning = this.dataSource.createQueryRunner();
    await queryRunning.connect();
    await queryRunning.startTransaction();
    try {
      // Step: 1 - Create the chat
      console.log('Created chat:, just before👹👹');
      const createdChat: Chat = await this.chatsRepository.insert();
      console.log('Created chat:', createdChat);
      // Step: 2 - Create the users in the chat
      const createdChatUsers: ChatUser[] = await Promise.all(
        [createChatPayload.from_user_id, createChatPayload.to_user_id].map(
          (userId) => {
            return this.chatUsersService.addUserToChat({
              userId,
              chatId: createdChat.id,
            });
          },
        ),
      );
      console.log(createdChatUsers);

      // Step: 3 - Create the message
      await this.messageService.createMessage({
        content: createChatPayload.content,
        fromUserId: createChatPayload.from_user_id,
        toUserId: createChatPayload.to_user_id,
        chatId: createdChat.id,
        status: 'sent',
      });

      // Step: 4 - Commit the transaction
      await queryRunning.commitTransaction();
      // Step: 5 - Release the query runner
      await queryRunning.release();
      // Step: 6 - Return the created chat
      const fetchChatPayload = {
        chatId: createdChat.id,
        userId: createChatPayload.from_user_id,
      };
      // Fetch the chat with details
      const chatWithDetails =
        await this.chatsRepository.getChatDetailsByChatIdUserId({
          ...fetchChatPayload,
        });
      return chatWithDetails;
    } catch (error) {
      console.error('Error creating chat:', error);
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
    }
  }

  async resetMessageCounter(chatId: number): Promise<Chat> {
    try {
      const updatedChat: Chat =
        await this.chatsRepository.resetMessageCounter(chatId);
      return updatedChat;
    } catch (error) {
      const messageError =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error resetting message counter: ' + messageError,
          code: 'CHAT_COUNTER_RESET_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async incrementMessageCounter(chatId: number): Promise<Chat> {
    try {
      const updatedChat: Chat =
        await this.chatsRepository.incrementMessageCounter(chatId);
      return updatedChat;
    } catch (error) {
      const messageError =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error incrementing message counter: ' + messageError,
          code: 'CHAT_COUNTER_INCREMENTING_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getChatById(chatId: number): Promise<Chat> {
    try {
      const chat: Chat = await this.chatsRepository.getChatById(chatId);
      return chat;
    } catch (error) {
      const messageError =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error getting chat by ID: ' + messageError,
          code: 'GETTING_CHAT_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllChatsByUserId(userId: number): Promise<ChatWithDetailsDto[]> {
    try {
      const chats: ChatWithDetailsDto[] =
        await this.chatsRepository.getAllChatsByUserId(userId);
      return chats;
    } catch (error) {
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
}
