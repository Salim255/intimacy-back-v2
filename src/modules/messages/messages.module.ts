import { Module } from '@nestjs/common';
import { MessageController } from './controllers/message.controller';
import { MessageService } from './services/message.service';
import { MessageRepository } from './repository/message.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Message]), // Add your entities here
  ],
  controllers: [MessageController],
  providers: [MessageService, MessageRepository],
  exports: [MessageService, MessageRepository], // Export the service and repository if needed in other modules
})
export class MessagesModule {}
