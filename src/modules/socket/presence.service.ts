import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/services/users.service';
import { MessageService } from '../messages/services/message.service';
import { Message } from '../messages/entities/message.entity';

@Injectable()
export class PresenceService {
  constructor(
    private readonly usersService: UsersService,
    private readonly messageService: MessageService,
  ) {}

  private onlineUsers = new Map<number, string>(); // userId -> socketId

  private logger = new Logger();
  async registerUser(userId: number, socketId: string) {
    // Save the socket
    this.onlineUsers.set(userId, socketId);
    this.logger.log(`User ${userId} registered with socket ${socketId}`);

    // Update client as online
    const result = await this.usersService.updateUserConnectionStatus(
      userId,
      'online',
    );

    if (!result.id) return;

    // Update all messages that sent to this client to delivered
    // Update all messages where this user is the receiver, to delivered
    const messages: Message[] =
      await this.messageService.updateAllMessagesToDelivered(userId);
    return messages;
  }

  unregisterUser(userId: number) {
    this.onlineUsers.delete(userId);
  }

  getOnlineUsers() {
    return this.onlineUsers;
  }

  getSocketIdByUserId(userId: number): string | undefined {
    return this.onlineUsers.get(userId);
  }

  isUserOnline(userId: number): boolean {
    return this.onlineUsers.has(userId);
  }
}
