import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PresenceService } from 'src/modules/socket/presence.service';

export type MessageNotifierPayloadDto = {
  fromUserId: number;
  toUserId: number;
  chatId: number;
  partnerStatus: 'in-room' | 'online';
};

@WebSocketGateway()
export class MessageGateway {
  // Create a logger specifically for this gateway
  private logger = new Logger('MessageGateway');

  // Inject the WebSocket server so we can emit events from the backend
  @WebSocketServer()
  server: Server;
  constructor(private presenceService: PresenceService) {}

  @SubscribeMessage('coming-message')
  handleSendMessage(client: Socket, data: MessageNotifierPayloadDto) {
    const partnerSocket = this.presenceService.getSocketIdByUserId(
      data.toUserId,
    );
    this.logger.log(data, 'Hello', partnerSocket);
    if (!partnerSocket) return;
    this.server
      .to(partnerSocket)
      .emit('coming-message', data, (partnerAckResponse: any) => {
        this.logger.log(partnerAckResponse, 'clikent acc ');
      });
  }
}
