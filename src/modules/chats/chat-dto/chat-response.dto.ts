import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

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
  avatar: string | null;
  last_name: string;
  first_name: string;
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
  no_read_messages: number;
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
        no_read_messages: 1,
        encrypted_session_base64: 'session_key',
        users: [
          {
            id: 1,
            avatar: null,
            last_name: 'Doshka',
            first_name: 'Doshka',
            connection_status: 'offline',
          },
          {
            id: 2,
            avatar: null,
            last_name: 'Salim',
            first_name: 'Salim',
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

export class UpdateChatCounterDto {
  @ApiProperty({ description: 'Chat ID', example: 3 })
  @IsNotEmpty()
  chat_id: number;

  @ApiProperty({ description: 'Update type', example: 'increment' })
  @IsNotEmpty()
  update_type: 'increment' | 'reset';
}

export class UpdateChatCounterResponseDto {
  @ApiProperty({ description: 'Status of the response', example: 'Success' })
  @IsNotEmpty()
  status: string;
  @ApiProperty({
    description: 'Updated chat details',
    type: Object,
    example: {
      chat: {
        id: 3,
        no_read_messages: 1,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        type: 'dual',
      },
    },
  })
  @IsNotEmpty()
  data: {
    chat: {
      id: number;
      no_read_messages: number;
      updated_at: string;
      created_at: string;
      type: string;
    };
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
          no_read_messages: 1,
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
