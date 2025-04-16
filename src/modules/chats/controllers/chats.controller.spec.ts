import { Test, TestingModule } from '@nestjs/testing';
import { ChatsController } from './chats.controller';
import { ChatsService } from '../services/chats.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserKeysService } from '../../user-keys/services/user-keys.service';
import { JwtTokenService } from '../../auth/jws-token-service';

describe('ChatsController', () => {
  let controller: ChatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatsController],
      providers: [
        {
          provide: ChatsService,
          useValue: {}, // Mock ChatsService if needed
        },
        {
          provide: JwtAuthGuard,
          useValue: {}, // Mock JwtAuthGuard if needed
        },
        {
          provide: UserKeysService,
          useValue: {}, // Mock UserKeysService if needed
        },
        {
          provide: JwtTokenService,
          useValue: {}, // Mock JwtTokenService if needed
        },
      ],
    }).compile();

    controller = module.get<ChatsController>(ChatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
