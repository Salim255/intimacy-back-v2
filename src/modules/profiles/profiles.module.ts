import { Module } from '@nestjs/common';
import { ProfilesService } from './services/profiles.service';
import { ProfilesController } from './controllers/profiles.controller';
import { ProfileRepository } from './repository/profile.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Profile]), AuthModule],
  controllers: [ProfilesController],
  providers: [ProfilesService, ProfileRepository],
})
export class ProfileModule {}
