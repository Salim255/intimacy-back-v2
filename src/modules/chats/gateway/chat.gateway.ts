import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PresenceGateway } from 'src/modules/socket/presence.gateway';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  constructor(private readonly presenceGateway: PresenceGateway) {}
  private logger = new Logger();

  @WebSocketServer()
  service: Server;
}
