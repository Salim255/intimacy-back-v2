import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessageService } from '../services/message.service';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PresenceGateway } from '../../socket/presence.gateway';

@WebSocketGateway()
export class MessageGateway {
  constructor(
    private readonly presenceGateway: PresenceGateway,
    private readonly messageService: MessageService,
  ) {}

  // Inject the WebSocket server so we can emit events from the backend
  @WebSocketServer()
  server: Server;

  // Create a logger specifically for this gateway
  private logger = new Logger('MessageGateway');
}
