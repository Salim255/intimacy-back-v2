export class CreateSessionDto {
  chat_id: number;
  sender_id: number;
  receiver_id: number;
  encrypted_session_for_sender: string;
  encrypted_session_for_receiver: string;
}

export class CreatedSessionResponseDto extends CreateSessionDto {
  created_at: Date;
  updated_at: Date;
}
