import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class PresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Map to track online users: userId => socketId
  private onlineUsers = new Map<string, string>();

  // Create a logger specifically for this gateway
  private logger = new Logger('PresenceGateway');

  // Triggered automatically when a client connects
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  // Triggered automatically when a client disconnects
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
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

  registerUser(userId: string, clientId: string) {
    if (!userId) return;
    this.onlineUsers.set(userId, clientId); // Save userId -> socketId
    this.logger.log(`User ${userId} registered with socket ${clientId}`);
  }
}
