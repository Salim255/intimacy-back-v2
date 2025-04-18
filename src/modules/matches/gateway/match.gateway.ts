import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PresenceService } from 'src/modules/socket/presence.service';

@WebSocketGateway({ cors: true })
export class MatchGateway {
  constructor(private readonly presenceService: PresenceService) {}

  @WebSocketServer()
  server: Server;
}
