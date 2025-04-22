import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PresenceService } from 'src/modules/socket/presence.service';

@WebSocketGateway({ cors: true })
export class RoomGateway {
  constructor(private readonly presenceService: PresenceService) {}
  private logger = new Logger();

  private generateRoomId(user1: number, user2: number) {
    return [user1, user2].sort().join('-'); // Sort to ensure consistent room IDs
  }
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-room')
  handleJoinRoom(
    client: Socket,
    data: {
      fromUserId: number;
      toUserId: number;
      chatId: number;
      lastMessageSenderId: number;
    },
  ) {
    console.log('Join room');
    const roomId = this.generateRoomId(data.fromUserId, data.toUserId);
    this.server.socketsJoin(roomId);

    const roomSize = this.server.sockets.adapter.rooms.get(roomId)?.size || 0;
    //const socketsInRoom = this.server.sockets.adapter.rooms.get(roomId);
    //console.log(roomSize, 'hello size', socketsInRoom);
    // Check if the sender is connected so we send the notification
    if (roomSize < 2) return;
    // Emit to all clients in the room (except sender)
    client.to(roomId).emit('partner-joined-room', data);
    // Emit to all clients in the room (include sender)
    //this.server.in(roomId).emit('partner-joined-room', data);
  }
}
