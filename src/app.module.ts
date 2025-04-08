import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/users/entities/user.entity';
import { UserKeysModule } from './modules/user-keys/user-keys.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make the config globally available
      envFilePath: '.env', // Path to your .env file
    }),
    TypeOrmModule.forRoot({
      type: 'postgres', // Change this to your database type
      url: process.env.DATABASE_URL, // Use environment variable or a local connection string
      autoLoadEntities: true, // Automatically load entities
      synchronize: true, // Be careful using this in production
      entities: [User],
    }),
    UsersModule,
    UserKeysModule, // Import UsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
