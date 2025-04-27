import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PresenceService } from 'src/modules/socket/presence.service';

export type JoinRomData = {
  fromUserId: number;
  toUserId: number;
  chatId: number | null;
};

@WebSocketGateway({ cors: true })
export class RoomGateway {
  constructor(private readonly presenceService: PresenceService) {}
  private logger = new Logger('RoomGateway');

  private generateRoomId(user1: number, user2: number) {
    return [user1, user2].sort().join('-'); // Sort to ensure consistent room IDs
  }
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(client: Socket, data: JoinRomData) {
    const roomId = this.generateRoomId(data.fromUserId, data.toUserId);
    await client.leave(roomId);
    // Now notify the remaining users in the room
    const room = this.server.sockets.adapter.rooms.get(roomId);
    if (room?.size) {
      this.server.to(roomId).emit('partner-left-room', data);
    }
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, data: JoinRomData) {
    this.logger.log('Join room');
    const roomId = this.generateRoomId(data.fromUserId, data.toUserId);
    this.server.socketsJoin(roomId);

    const roomSize = this.server.sockets.adapter.rooms.get(roomId)?.size || 0;
    //const socketsInRoom = this.server.sockets.adapter.rooms.get(roomId);
    // Check if the sender is connected so we send the notification
    if (roomSize < 2) return;
    // Emit to all clients in the room (except sender)
    //client.to(roomId).emit('partner-joined-room', data);
    // Emit to all clients in the room (include sender)
    this.server.in(roomId).emit('partner-joined-room', data);
  }
}
