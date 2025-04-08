import { Module } from '@nestjs/common';
import { UserKeysService } from './services/user-keys.service';
import { UserKeysController } from './controllers/user-keys.controller';
import { UserKeysRepository } from './repository/user-keys.repository';

@Module({
  controllers: [UserKeysController],
  providers: [UserKeysService, UserKeysRepository],
  exports: [UserKeysService],
})
export class UserKeysModule {}
