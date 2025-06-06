import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Message } from '../../../modules/messages/entities/message.entity';
import { PartnerConnectionStatus } from '../../../modules/messages/message-dto/message-dto';

export class CreateChatDto {
  @ApiProperty({ description: 'Message content' })
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Sender Id' })
  @IsNotEmpty()
  from_user_id: number;

  @ApiProperty({ description: 'Receiver Id' })
  @IsNotEmpty()
  to_user_id: number;

  @ApiProperty({ description: `Sender Session Key` })
  @IsNotEmpty()
  session_key_sender: string;

  @ApiProperty({ description: `Receiver Session Key` })
  @IsNotEmpty()
  session_key_receiver: string;

  @ApiProperty({
    description: 'Receiver connection status',
    example: 'online',
    enum: PartnerConnectionStatus,
  })
  @IsNotEmpty()
  @IsEnum(PartnerConnectionStatus)
  partner_connection_status: PartnerConnectionStatus;
}

export class LastMessageDto {
  id: number;
  created_at: string;
  content: string;
  from_user_id: number;
  to_user_id: number;
  status: number;
  chat_id: number;
}

export class UserInChatDto {
  user_id: number;
  name: string;
  photos: string[];
  city: string;
  country: string;
  birth_date: Date;
  connection_status: string;
  is_admin: boolean;
}

export class MessageDto {
  id: number;
  created_at: string;
  updated_at: string;
  content: string;
  from_user_id: number;
  to_user_id: number;
  status: number;
  chat_id: number;
}

export class ChatWithDetailsDto {
  id: number;
  type: string;
  created_at: string;
  updated_at: string;
  delivered_messages_count: number;
  encrypted_session_base64: string;
  last_message: LastMessageDto | null;
  users: UserInChatDto[];
  messages: MessageDto[];
}

export class CreateChatResponseDto {
  @ApiProperty({ description: 'Status of the response', example: 'Success' })
  @IsNotEmpty()
  status: string;
  @ApiProperty({
    description: 'Created chat details',
    type: Object,
    example: {
      chat: {
        id: 3,
        type: 'dual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        delivered_messages_count: 1,
        encrypted_session_base64: 'session_key',
        users: [
          {
            user_id: 1,
            photos: ['url1', 'url2'],
            name: 'Doshka',
            city: 'Lille',
            country: 'France',
            birth_date: 'birth_date',
            connection_status: 'offline',
          },
          {
            user_id: 2,
            photos: ['url1', 'url2'],
            name: 'Mike',
            city: 'Lille',
            country: 'France',
            birth_date: 'birth_date',
            connection_status: 'offline',
          },
        ],
        messages: [
          {
            id: 4,
            status: 'sent',
            chat_id: 3,
            content: 'Hello',
            created_at: new Date().toISOString(),
            to_user_id: 1,
            updated_at: new Date().toISOString(),
            from_user_id: 2,
          },
        ],
      },
    },
  })
  @IsNotEmpty()
  data: {
    chat: ChatWithDetailsDto;
  };
}
export class ChatResponse {
  status: string;
  data: {
    chat: ChatWithDetailsDto[];
  };
}

export class FetchChatsResponseDto {
  @ApiProperty({ description: 'Status of the response', example: 'Success' })
  @IsNotEmpty()
  status: string;
  @ApiProperty({
    description: 'Fetched chats details',
    type: Object,
    example: {
      chats: [
        {
          id: 3,
          type: 'dual',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          delivered_messages_count: 1,
          encrypted_session_base64: 'session_key',
          users: [
            {
              id: 1,
              avatar: null,
              last_name: 'Doshka',
              first_name: 'Doshka',
              connection_status: 'offline',
              is_admin: false,
            },
            {
              id: 2,
              avatar: null,
              last_name: 'Salim',
              first_name: 'Salim',
              connection_status: 'offline',
              is_admin: true,
            },
          ],
          messages: [
            {
              id: 4,
              status: 'sent',
              chat_id: 3,
              content: 'Hello',
              created_at: new Date().toISOString(),
              to_user_id: 1,
              updated_at: new Date().toISOString(),
              from_user_id: 2,
            },
          ],
        },
      ],
    },
  })
  @IsNotEmpty()
  data: {
    chats: ChatWithDetailsDto[];
  };
}

export class FitchSingleChatWithDetailsResponse {
  @ApiProperty({ description: 'Status of the response', example: 'Success' })
  @IsNotEmpty()
  status: string;
  @ApiProperty({
    description: 'Fetched chat details',
    type: Object,
    example: {
      chat: {
        id: 3,
        type: 'dual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        encrypted_session_base64: 'session_key',
        delivered_messages_count: 1,
        users: [
          {
            id: 1,
            avatar: null,
            last_name: 'Doshka',
            first_name: 'Doshka',
            connection_status: 'offline',
            is_admin: false,
          },
          {
            id: 2,
            avatar: null,
            last_name: 'Salim',
            first_name: 'Salim',
            connection_status: 'offline',
            is_admin: true,
          },
        ],
        messages: [
          {
            id: 4,
            status: 'sent',
            chat_id: 3,
            content: 'Hello',
            created_at: new Date().toISOString(),
            to_user_id: 1,
            updated_at: new Date().toISOString(),
            from_user_id: 2,
          },
        ],
      },
    },
  })
  @IsNotEmpty()
  data: {
    chat: ChatWithDetailsDto;
  };
}

export class UpdateActiveChatMessagesToReadResponseDto {
  @ApiProperty({ description: 'Status of the response', example: 'Success' })
  status: string;

  @ApiProperty({
    description: 'Updated messages',
    example: {
      messages: [Message],
    },
  })
  data: {
    messages: Message[];
  };
}
