import { Injectable } from '@nestjs/common';
import { ChatUserRepository } from '../repository/chat-user.repository';
import { ChatUser } from '../entities/chat-user.entity';

type CreateChatUserPayload = {
  userId: number;
  chatId: number;
  isAdmin: boolean;
};
@Injectable()
export class ChatUsersService {
  constructor(private readonly chatUserRepository: ChatUserRepository) {}

  async addUserToChat(
    createChatUserPayload: CreateChatUserPayload,
  ): Promise<ChatUser> {
    const createdChatUser: ChatUser = await this.chatUserRepository.insert(
      createChatUserPayload,
    );
    return createdChatUser;
  }
}
