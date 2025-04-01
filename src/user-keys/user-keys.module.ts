import { Module } from '@nestjs/common';
import { UserKeysService } from './user-keys.service';
import { UserKeysController } from './user-keys.controller';

@Module({
  providers: [UserKeysService],
  controllers: [UserKeysController]
})
export class UserKeysModule {}
