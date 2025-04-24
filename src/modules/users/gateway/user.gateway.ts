import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../services/users.service';
import { PresenceService } from 'src/modules/socket/presence.service';

// Decorator to declare a WebSocket Gateway
// Declare this class as a WebSocket Gateway
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class UserGateway {
  constructor(
    private readonly presenceService: PresenceService,
    private readonly usersService: UsersService,
  ) {}
  // Inject the WebSocket server so we can emit events from the backend
  @WebSocketServer()
  server: Server;

  // Create a logger specifically for this gateway
  private logger = new Logger('UserGateway');

  // Handle listen to user register
  @SubscribeMessage('register-user')
  async handleRegister(client: Socket, userId: number) {
    if (!userId || !client.id) return;
    await this.presenceService.registerUser(userId, client.id);
    //if (!messagesWithDeliveredSignature) return;
    // Notify partners
    client.broadcast.emit('user-online', { userId, status: 'online' });
  }
}
