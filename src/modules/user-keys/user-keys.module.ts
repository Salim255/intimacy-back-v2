import { Module } from '@nestjs/common';
import { UserKeysService } from './services/user-keys.service';
import { UserKeysRepository } from './repository/user-keys.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserKeys } from './entities/user-keys.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserKeys])],
  providers: [UserKeysRepository, UserKeysService],
  exports: [UserKeysService],
})
export class UserKeysModule {}
