import { Module } from '@nestjs/common';
import { MessageController } from './controllers/message.controller';
import { MessageService } from './services/message.service';
import { MessageRepository } from './repository/message.repository';

@Module({
  controllers: [MessageController],
  providers: [MessageService, MessageRepository],
})
export class MessagesModule {}
