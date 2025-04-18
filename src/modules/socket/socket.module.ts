import { forwardRef, Module } from '@nestjs/common';
import { PresenceGateway } from './presence.gateway';
import { PresenceService } from './presence.service';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [forwardRef(() => UsersModule), forwardRef(() => MessagesModule)],
  providers: [PresenceGateway, PresenceService],
  exports: [PresenceService],
})
export class SocketModule {}
