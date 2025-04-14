import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtTokenService } from './jws-token-service';

@Module({
  imports: [
    // REGISTER JwtModule with a secret
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
  providers: [JwtAuthGuard, JwtTokenService],
  exports: [JwtAuthGuard, JwtModule, JwtTokenService],
})
export class AuthModule {}
