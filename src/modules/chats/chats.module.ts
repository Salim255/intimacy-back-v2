import { Module } from '@nestjs/common';
import { ChatsController } from './controllers//chats.controller';
import { ChatsService } from './services/chats.service';
import { ChatRepository } from './repository/chat.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { ChatUsersModule } from '../chat-users/chat-users.module';
import { MessagesModule } from '../messages/messages.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Chat]), // Add your entities here
    ChatUsersModule, // Import the ChatUsersModule to use its services and repositories
    MessagesModule, // Import the MessagesModule to use its services and repositories
  ],
  controllers: [ChatsController],
  providers: [ChatsService, ChatRepository],
  exports: [ChatsService], // Export the service and repository if needed in other modules
})
export class ChatsModule {}
