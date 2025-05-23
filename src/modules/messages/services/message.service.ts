import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MessageRepository } from '../repository/message.repository';
import { Message } from '../entities/message.entity';
import { CreatedMessageDto } from '../message-dto/message-dto';

export type CreateMessagePayload = {
  content: string;
  fromUserId: number;
  toUserId: number;
  chatId: number;
  status: string;
};

@Injectable()
export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}
  async createMessage(
    createMessagePayload: CreateMessagePayload,
  ): Promise<CreatedMessageDto> {
    try {
      const createdMessage: Message =
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
}
