import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessageService } from '../services/message.service';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PresenceGateway } from 'src/modules/socket/presence.gateway';

@WebSocketGateway()
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly presenceGateway: PresenceGateway,
    private readonly messageService: MessageService,
  ) {}

  // Inject the WebSocket server so we can emit events from the backend
  @WebSocketServer()
  server: Server;

  // Create a logger specifically for this gateway
  private logger = new Logger('UserGateway');

  // This method is triggered automatically when a new client connects
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`); // Log the client ID
    // Optional: You could authenticate the client here using headers or query params
  }

  // This method is triggered automatically when a client disconnects
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`); // Log the disconnection
    // Optional: Clean up any state related to this client
  }
}
