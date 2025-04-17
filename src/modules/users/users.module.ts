import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './repository/user.repository';
import { UserKeysModule } from '../user-keys/user-keys.module';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { FileUploadModule } from '../../common/file-upload/file-upload.module';
import { UserGateway } from './socket-io/user.gateway';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UserKeysModule,
    AuthModule,
    FileUploadModule,
    SocketModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, UserGateway],
  exports: [UsersService, UserRepository, UserGateway],
})
export class UsersModule {}
