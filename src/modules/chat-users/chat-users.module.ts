import { Module } from '@nestjs/common';
import { ChatUsersController } from './controllers/chat-users.controller';
import { ChatUsersService } from './services/chat-users.service';
import { ChatUserRepository } from './repository/chat-user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatUser } from './entities/chat-user.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([ChatUser]), // Add your entities here
  ],
  controllers: [ChatUsersController],
  providers: [ChatUsersService, ChatUserRepository],
  exports: [ChatUsersService, ChatUserRepository], // Export the service and repository if needed in other modules
})
export class ChatUsersModule {}
