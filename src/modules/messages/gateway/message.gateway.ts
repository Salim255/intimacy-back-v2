import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessageService } from '../services/message.service';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PresenceService } from 'src/modules/socket/presence.service';
import { Message } from '../entities/message.entity';

@WebSocketGateway()
export class MessageGateway {
  // Create a logger specifically for this gateway
  private logger = new Logger('MessageGateway');

  // Inject the WebSocket server so we can emit events from the backend
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly presenceService: PresenceService,
    private readonly messageService: MessageService,
  ) {}
  @SubscribeMessage('send-message')
  handleSendMessage(
    client: Socket,
    messagePayload: {
      message: Message;
      fromUserId: number;
      toUserId: number;
      roomId: string;
    },
  ) {
    this.logger.log(messagePayload);
  }
}
