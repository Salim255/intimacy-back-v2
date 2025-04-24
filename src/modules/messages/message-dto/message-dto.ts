import { IsNotEmpty } from 'class-validator';
import { Message } from '../entities/message.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum PartnerConnectionStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  InRoom = 'in-room',
}
export class CreateMessageDto {
  @ApiProperty({
    description: 'The content of the message',
    example: 'Hello, how are you?',
  })
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'The user ID of the sender',
    example: 1,
  })
  @IsNotEmpty()
  from_user_id: number;

  @ApiProperty({
    description: 'The user ID of the recipient',
    example: 2,
  })
  @IsNotEmpty()
  to_user_id: number;

  @ApiProperty({
    description: 'The chat ID',
    example: 1,
  })
  @IsNotEmpty()
  chat_id: number;

  @ApiProperty({
    description: 'The status of the message',
    example: 'sent',
  })
  @IsNotEmpty()
  partner_connection_status: PartnerConnectionStatus;
}

export class CreatedMessageDto {
  id: number;
  content: string;
  from_user_id: number;
  to_user_id: number;
  chat_id: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}
export class CreateMessageResponseDto {
  @ApiProperty({
    description: 'The status of the response',
    example: 'success',
  })
  status: string;
  @ApiProperty({
    description: 'The created message',
    type: CreatedMessageDto,
    example: {
      message: {
        id: 1,
        content: 'Hello, how are you?',
        from_user_id: 1,
        to_user_id: 2,
        chat_id: 1,
        status: 'sent',
        created_at: new Date(),
        updated_at: new Date(),
      },
    },
  })
  data: {
    message: CreatedMessageDto;
  };
}
export class FetchMessagesDto {
  chatId: number;
  userId: number;
}
export class FetchMessagesResponseDto {
  status: string;
  data: {
    messages: Message[];
  };
}
