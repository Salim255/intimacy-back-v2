import { Module } from '@nestjs/common';
import { ChatsController } from './controllers//chats.controller';
import { ChatsService } from './services/chats.service';

@Module({
  controllers: [ChatsController],
  providers: [ChatsService],
})
export class ChatsModule {}
