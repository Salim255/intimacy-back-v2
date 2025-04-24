import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PresenceService } from 'src/modules/socket/presence.service';

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
      client.to(data.roomId).emit('notify-user-typing', data);
    }
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
      client.to(data.roomId).emit('notify-user-stop-typing', data.typingStatus);
    }
  }
}
