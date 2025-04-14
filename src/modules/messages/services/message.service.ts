import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MessageRepository } from '../repository/message.repository';
import { Message } from '../entities/message.entity';

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
  async createMessage(createMessagePayload: CreateMessagePayload) {
    try {
      const createdMessage: Message =
        await this.messageRepository.insert(createMessagePayload);
      return createdMessage;
    } catch (error) {
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
