import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { UserKeysModule } from './modules/user-keys/user-keys.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { MatchesModule } from './modules/matches/matches.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ChatsModule } from './modules/chats/chats.module';
import { ChatUsersModule } from './modules/chat-users/chat-users.module';
import { SessionKeysModule } from './session-keys/session-keys.module';
import { ProfileModule } from './modules/profiles/profiles.module';

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
    ChatsModule,
    ChatUsersModule,
    MessagesModule,
    SessionKeysModule,
    ProfileModule,
  ],
  controllers: [AppController], // Controller to handle incoming requests
  providers: [AppService],
})
export class AppModule {}
