import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChatsRepository } from '../repository/chat.repository';
import { Chat } from '../entities/chat.entity';
import { ChatWithDetailsDto } from '../chat-dto/chat-response.dto';

@Injectable()
export class ChatsService {
  constructor(private readonly chatsRepository: ChatsRepository) {}

  async createChat(): Promise<Chat> {
    try {
      const createdChat: Chat = await this.chatsRepository.insert();
      return createdChat;
    } catch (error) {
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
