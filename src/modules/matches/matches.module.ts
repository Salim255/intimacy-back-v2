import { Module } from '@nestjs/common';
import { MatchesController } from './controllers/matches.controller';
import { MatchesService } from './services/matches.service';
import { MatchRepository } from './repository/match.repository';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { UserRepository } from '../users/repository/user.repository';
import { MatchGateway } from './gateway/match.gateway';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [TypeOrmModule.forFeature([Match]), AuthModule, SocketModule],
  controllers: [MatchesController],
  providers: [MatchesService, MatchRepository, UserRepository, MatchGateway],
  exports: [MatchRepository, MatchesService],
})
export class MatchesModule {}
