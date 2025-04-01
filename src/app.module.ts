import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', // Change this to your database type
      url: process.env.DATABASE_URL, // Use environment variable or a local connection string
      autoLoadEntities: true, // Automatically load entities
      synchronize: true, // Be careful using this in production
      entities: [User],
    }),
    UsersModule, // Import UsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
