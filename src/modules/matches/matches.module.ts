import { Module } from '@nestjs/common';
import { MatchesController } from './controllers/matches.controller';
import { MatchesService } from './services/matches.service';
import { MatchRepository } from './repository/match.repository';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { UserRepository } from '../users/repository/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Match]), AuthModule],
  controllers: [MatchesController],
  providers: [MatchesService, MatchRepository, UserRepository],
  exports: [MatchRepository, MatchesService],
})
export class MatchesModule {}
