import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../services/users.service';
import { PresenceGateway } from '../../socket/presence.gateway';

// Decorator to declare a WebSocket Gateway
// Declare this class as a WebSocket Gateway
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class UserGateway {
  constructor(
    private readonly presenceGateway: PresenceGateway,
    private readonly usersService: UsersService,
  ) {}
  // Inject the WebSocket server so we can emit events from the backend
  @WebSocketServer()
  server: Server;

  // Create a logger specifically for this gateway
  private logger = new Logger('UserGateway');

  // Handle listen to user register
  @SubscribeMessage('register-user')
  handleRegister(client: Socket, userId: string) {
    this.presenceGateway.registerUser(userId, client.id);
    // Update status to online
    //const result = await this.userService.updateUserStatus(userId, 'online');
    // Optional: Trigger message service logic (e.g., mark delivered)
    //await this.messageService.updateAllMessagesWithPartnerReconnect(userId);
  }
}
