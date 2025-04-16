import { Injectable } from '@nestjs/common';
import { ChatUserRepository } from '../repository/chat-user.repository';

type CreateChatUserPayload = {
  userId: number;
  chatId: number;
  isAdmin: boolean;
};
@Injectable()
export class ChatUsersService {
  constructor(private readonly chatUserRepository: ChatUserRepository) {}

  async addUserToChat(createChatUserPayload: CreateChatUserPayload) {
    const createdChatUser = await this.chatUserRepository.insert(
      createChatUserPayload,
    );
    return createdChatUser;
  }
}
