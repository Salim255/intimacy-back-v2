import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PresenceService } from '../../../modules/socket/presence.service';

type TypingNotificationPayload = {
  chatId: number;
  roomId: string;
  toUserId: number;
  typingStatus: string;
};

@WebSocketGateway()
export class TypingGateway {
  // Create a logger specifically for this gateway
  private logger = new Logger('TypingGateway');
  // Inject the WebSocket server so we can emit events from the backend
  @WebSocketServer()
  server: Server;
  constructor(private readonly presenceService: PresenceService) {}

  @SubscribeMessage('user-typing')
  handleUserTyping(client: Socket, data: TypingNotificationPayload) {
    this.logger.log('Start typing', data.roomId);
    const partnerSocket = this.presenceService.getSocketIdByUserId(
      data.toUserId,
    );
    this.logger.log('Start typing', partnerSocket, data.roomId);
    if (!partnerSocket) return;
    this.server.to(partnerSocket).emit('notify-user-typing', data);
  }

  @SubscribeMessage('user-stop-typing')
  handleUserStopTyping(client: Socket, data: TypingNotificationPayload) {
    this.logger.log('Start typing', data.roomId);
    const partnerSocket = this.presenceService.getSocketIdByUserId(
      data.toUserId,
    );

    if (!partnerSocket) return;
    this.logger.log('Stop typing', data.roomId);
    this.server.to(partnerSocket).emit('notify-user-stop-typing', data);
  }
}
