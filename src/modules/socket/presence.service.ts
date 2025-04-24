import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/services/users.service';
import { MessageService } from '../messages/services/message.service';
import { Message } from '../messages/entities/message.entity';
import { UserDto } from '../users/user-dto/user-dto';

@Injectable()
export class PresenceService {
  constructor(
    private readonly usersService: UsersService,
    private readonly messageService: MessageService,
  ) {}

  private onlineUsers = new Map<number, string>(); // userId -> socketId

  private logger = new Logger();

  async registerUser(
    userId: number,
    socketId: string,
  ): Promise<Message[] | null> {
    try {
      // Save the socket
      this.onlineUsers.set(userId, socketId);
      this.logger.log(`User ${userId} registered with socket ${socketId}`);

      // Update client as online
      const result: UserDto =
        await this.usersService.updateUserConnectionStatus(userId, 'online');
      if (!result || !result.id) return null;

      // Update all messages that sent to this client to delivered
      // Update all messages where this user is the receiver, to delivered
      const messages: Message[] =
        await this.messageService.updateAllMessagesToDelivered(userId);
      return messages;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error in register socket: ' + errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

  async removeUser(socketId: string): Promise<UserDto | null> {
    for (const [userId, sId] of this.onlineUsers.entries()) {
      if (sId === socketId) {
        // Remove from custom data structure
        this.onlineUsers.delete(userId);
        const result = await this.usersService.updateUserConnectionStatus(
          userId,
          'offline',
        );
        return result;
      }
    }
    return null;
  }
}
