import { Test, TestingModule } from '@nestjs/testing';
import { ChatUsersService } from './chat-users.service';
import { ChatUserRepository } from '../repository/chat-user.repository';

const mockChatUserRepository = {
  // Mock methods of ChatUserRepository here
};
describe('ChatUsersService', () => {
  let service: ChatUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatUsersService,
        {
          provide: ChatUserRepository,
          useValue: mockChatUserRepository,
        },
      ],
    }).compile();

    service = module.get<ChatUsersService>(ChatUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
