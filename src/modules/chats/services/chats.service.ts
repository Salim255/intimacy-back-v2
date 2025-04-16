import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChatRepository } from '../repository/chat.repository';
import { Chat } from '../entities/chat.entity';
import { ChatWithDetailsDto } from '../chat-dto/chat-response.dto';
import { MessageService } from '../../messages/services/message.service';
import { ChatUsersService } from '../../chat-users/services/chat-users.service';
import { DataSource } from 'typeorm';

type CreateChatPayload = {
  content: string;
  from_user_id: number;
  to_user_id: number;
  session_key_sender: string;
  session_key_receiver: string;
};

type UpdateChatCounterPayload = {
  chatId: number;
  updateType: 'increment' | 'reset';
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
      const createdChat: Chat = await this.chatsRepository.insert();

      // Step: 2 - Create the users in the chat
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

      // Step: 3 - Create the message
      await this.messageService.createMessage({
        content: createChatPayload.content,
        fromUserId: createChatPayload.from_user_id,
        toUserId: createChatPayload.to_user_id,
        chatId: createdChat.id,
        status: 'sent',
      });

      // Step: 4 - Return the created chat
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

  async updateChatCounter(
    updatePayload: UpdateChatCounterPayload,
  ): Promise<Chat> {
    try {
      const { chatId, updateType } = updatePayload;
      let updatedChat: Chat | null = null;

      if (updateType === 'increment') {
        updatedChat =
          await this.chatsRepository.incrementMessageCounter(chatId);
      } else if (updateType === 'reset') {
        updatedChat = await this.chatsRepository.resetMessageCounter(chatId);
      }

      if (!updatedChat) {
        throw new HttpException(
          {
            status: 'fail',
            message: 'Invalid update type provided',
            code: 'INVALID_UPDATE_TYPE',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return updatedChat;
    } catch (error) {
      const messageError =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error updating chat counter: ' + messageError,
          code: 'CHAT_COUNTER_UPDATE_ERROR',
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
}
