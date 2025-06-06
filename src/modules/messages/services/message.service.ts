import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MessageRepository } from '../repository/message.repository';
import { Message } from '../entities/message.entity';
import {
  CreatedMessageDto,
  PartnerConnectionStatus,
} from '../message-dto/message-dto';

export type CreateMessagePayload = {
  content: string;
  from_user_id: number;
  to_user_id: number;
  chat_id: number;
  partner_connection_status: PartnerConnectionStatus;
};

@Injectable()
export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}
  async createMessage(
    createMessagePayload: CreateMessagePayload,
  ): Promise<CreatedMessageDto> {
    try {
      const createdMessage: CreatedMessageDto =
        await this.messageRepository.insert(createMessagePayload);

      const response: CreatedMessageDto = { ...createdMessage };
      return response;
    } catch (error) {
      console.error('Error creating message:', error);
      const messageError =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Failed to create message: ' + messageError,
          code: 'CREATION_MESSAGE_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateAllMessagesToDelivered(userId: number): Promise<Message[]> {
    try {
      const messages =
        await this.messageRepository.markAllMessagesAsDeliveredForUser(userId);
      return messages;
    } catch (error) {
      const messageError =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Failed to update messages: ' + messageError,
          code: 'UPDATE_MESSAGES_TO_DELIVERED_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateMessagesInActiveChatToDelivered(
    formUserId: number,
    toUserId: number,
  ) {
    try {
      const updatedMessages =
        await this.messageRepository.updateMessagesToDelivered(
          formUserId,
          toUserId,
        );
      return updatedMessages;
    } catch (error) {
      const messageError =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Failed to update messages: ' + messageError,
          code: 'UPDATE_MESSAGES_TO_DELIVERED_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
