import { Test, TestingModule } from '@nestjs/testing';
import { ChatsService } from './chats.service';
import { ChatRepository } from '../repository/chat.repository';
import { MessageService } from '../../messages/services/message.service';
import { ChatUsersService } from '../../chat-users/services/chat-users.service';
import { DataSource } from 'typeorm';
import { JwtTokenService } from '../../auth/jws-token-service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

const mockChatsRepository = {
  // Mock methods of ChatsRepository here
  // For example:
};

describe('ChatsService', () => {
  let service: ChatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatsService,
        {
          provide: ChatRepository,
          useValue: mockChatsRepository,
        },
        {
          provide: MessageService,
          useValue: {}, // Mock MessageService if needed
        },
        {
          provide: ChatUsersService,
          useValue: {}, // Mock ChatUsersService if needed
        },
        {
          provide: DataSource,
          useValue: {},
        },
        {
          provide: JwtTokenService,
          useValue: {}, // Mock JwtTokenService if needed
        },
        {
          provide: JwtAuthGuard,
          useValue: {}, // Mock JwtAuthGuard if needed
        },
      ],
    }).compile();

    service = module.get<ChatsService>(ChatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
