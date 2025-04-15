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
  ): Promise<Message> {
    try {
      const createdMessage: Message =
        await this.messageRepository.insert(createMessagePayload);

     /*  const response: CreatedMessageDto = {
        id: createdMessage.id,
        content: createdMessage.content,
        from_user_id: createdMessage.from_user_id,
        to_user_id: createdMessage.to_user_id,
        chat_id: createdMessage.chat_id,
        status: createdMessage.status,
        created_at: createdMessage.created_at,
        updated_at: createdMessage.updated_at,
      }; */
      return createdMessage;
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
