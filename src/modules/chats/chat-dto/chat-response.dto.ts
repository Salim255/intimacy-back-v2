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
export class ChatResponse {
  status: string;
  data: {
    chat: ChatWithDetailsDto[];
  };
}
