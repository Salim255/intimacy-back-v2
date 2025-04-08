import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './repository/user.repository';
import { UserKeysModule } from '../user-keys/user-keys.module';
import { User } from './entities/user.entity';
import { JwtTokenService } from 'src/utils/jws-token-service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UserKeysModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, JwtTokenService, JwtService],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
