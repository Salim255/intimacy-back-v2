import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { UserKeysModule } from './modules/user-keys/user-keys.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { MatchesModule } from './modules/matches/matches.module';
import { MessagesModule } from './modules/messages/messages.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make the config globally available
      envFilePath: '.env', // Path to .env file
    }),
    DatabaseModule,
    UsersModule,
    UserKeysModule,
    MatchesModule,
    MessagesModule,
  ],
  controllers: [AppController], // Controller to handle incoming requests
  providers: [AppService],
})
export class AppModule {}
