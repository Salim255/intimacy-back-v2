import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PresenceService } from 'src/modules/socket/presence.service';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  constructor(private readonly presenceService: PresenceService) {}
  private logger = new Logger();

  @WebSocketServer()
  service: Server;
}
