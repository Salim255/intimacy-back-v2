import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../services/users.service';
import { PresenceGateway } from 'src/modules/socket/presence.gateway';

// Decorator to declare a WebSocket Gateway
// Declare this class as a WebSocket Gateway
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly presenceGateway: PresenceGateway,
    private readonly usersService: UsersService,
  ) {}
  // Inject the WebSocket server so we can emit events from the backend
  @WebSocketServer()
  server: Server;

  // Map to track connected users: userId => socketId
  private onlineUsers = new Map<string, string>();

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

  // This method listens for the 'ping' event sent by the client
  @SubscribeMessage('ping')
  handlePing(client: Socket, payload: any) {
    this.logger.log(`Received ping from ${client.id}`, payload); // Log the ping

    // Respond to the client with a 'pong' event and a message + timestamp
    client.emit('pong', {
      message: 'pong received',
      time: new Date(),
    });
  }

  // Handle listen to user register
  @SubscribeMessage('register-user')
  handleRegister(client: Socket, userId: string) {
    if (!userId) return;
    this.onlineUsers.set(userId, client.id); // Save userId -> socketId
    this.logger.log(`User ${userId} registered with socket ${client.id}`);
    // Update status to online
    //const result = await this.userService.updateUserStatus(userId, 'online');
    // Optional: Trigger message service logic (e.g., mark delivered)
    //await this.messageService.updateAllMessagesWithPartnerReconnect(userId);
  }
}
