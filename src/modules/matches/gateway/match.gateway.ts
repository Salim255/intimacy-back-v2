import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PresenceGateway } from 'src/modules/socket/presence.gateway';

@WebSocketGateway({ cors: true })
export class MatchGateway {
  constructor(private readonly presenceGateway: PresenceGateway) {}

  @WebSocketServer()
  server: Server;
}
