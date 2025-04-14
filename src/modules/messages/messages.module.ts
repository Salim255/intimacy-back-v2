import { Module } from '@nestjs/common';
import { MessageController } from './controllers/message.controller';
import { MessageService } from './services/message.service';

@Module({
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessagesModule {}
