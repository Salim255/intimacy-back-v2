import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PresenceService } from '../../../modules/socket/presence.service';

type NewChatNotifier = {
  chatId: number;
  partnerId: number;
};

@WebSocketGateway({ cors: true })
export class ChatGateway {
  constructor(private readonly presenceService: PresenceService) {}
  private logger = new Logger('ChatGateway');

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('new-chat')
  handleNewChat(client: Socket, data: NewChatNotifier) {
    const partnerSocket = this.presenceService.getSocketIdByUserId(
      data.partnerId,
    );
    if (!partnerSocket) return;
    if (!this.server.sockets.sockets.has(partnerSocket)) {
      this.logger.warn(`Socket ${partnerSocket} not found or disconnected`);
      return;
    }
    this.server.to(partnerSocket).emit('coming-new-chat', data);
  }
}
