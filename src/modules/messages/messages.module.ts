import { Module } from '@nestjs/common';
import { MessageController } from './controllers/message.controller';
import { MessageService } from './services/message.service';
import { MessageRepository } from './repository/message.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessageGateway } from './gateway/message.gateway';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]), // Add your entities here
    SocketModule,
  ],
  controllers: [MessageController],
  providers: [MessageService, MessageRepository, MessageGateway],
  exports: [MessageService, MessageRepository, MessageGateway], // Export the service and repository if needed in other modules
})
export class MessagesModule {}
