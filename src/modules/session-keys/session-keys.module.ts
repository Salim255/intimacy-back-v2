import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionKeys } from './entities/session-keys.entity';
import { SessionKaysService } from './services/session-kays.service';
import { SessionKeysRepository } from './repository/session-keys.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SessionKeys])],
  providers: [SessionKaysService, SessionKeysRepository],
  exports: [SessionKaysService],
})
export class SessionKeysModule {}
