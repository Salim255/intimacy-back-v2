import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './repository/user.repository';
import { UserKeysModule } from '../user-keys/user-keys.module';
import { User } from './entities/user.entity';
import { JwtTokenService } from 'src/utils/jws-token-service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UserKeysModule,
    // 👇 REGISTER JwtModule with a secret
    JwtModule.registerAsync({
      imports: [ConfigModule], // 👈 Important!
      inject: [ConfigService],
      // eslint-disable-next-line @typescript-eslint/require-await
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRATION') || '1h' },
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, JwtTokenService],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
