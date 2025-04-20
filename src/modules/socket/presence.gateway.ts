import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PresenceService } from './presence.service';

@WebSocketGateway({ cors: true })
export class PresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private presenceService: PresenceService) {}
  @WebSocketServer()
  server: Server;

  // Create a logger specifically for this gateway
  private logger = new Logger('PresenceGateway');

  // Triggered automatically when a client connects
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.on('disconnecting', async () => {
      this.logger.log('User disconnecting....👹👹', client.id);
      const userOffline = await this.presenceService.removeUser(client.id);
      if (!userOffline) return;
      client.broadcast.emit('user-offline', userOffline);
    });
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
}
