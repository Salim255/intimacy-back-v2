import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PresenceService } from 'src/modules/socket/presence.service';
import { Socket } from 'dgram';

@WebSocketGateway()
export class TypingGateway {
  // Create a logger specifically for this gateway
  private logger = new Logger('TypingGateway');
  // Inject the WebSocket server so we can emit events from the backend
  @WebSocketServer()
  server: Server;
  constructor(private readonly presenceService: PresenceService) {}

  @SubscribeMessage('user-typing')
  handleUserTyping(
    client: Socket,
    data: {
      roomId: string;
      toUserId: number;
      typingStatus: string;
    },
  ) {
    if (data.roomId) {
      this.logger.log(data, 'hLLo typing'); //////////
      this.server.to(data.roomId).emit('notify-user-typing', data);
    }
    this.logger.log(data, 'hLLo typing'); //////////
  }

  @SubscribeMessage('user-stop-typing')
  handleUserStopTyping(
    client: Socket,
    data: {
      roomId: string;
      toUserId: number;
      typingStatus: string;
    },
  ) {
    if (data.roomId) {
      this.logger.log(data, 'Stop typing');
      this.server
        .to(data.roomId)
        .emit('notify-user-stop-typing', data.typingStatus);
    }
  }
}
