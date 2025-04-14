import { Module } from '@nestjs/common';
import { UserChatController } from './controllers/user-chat.controller';
import { UserChatService } from './services/user-chat.service';

@Module({
  controllers: [UserChatController],
  providers: [UserChatService],
})
export class UserChatsModule {}
