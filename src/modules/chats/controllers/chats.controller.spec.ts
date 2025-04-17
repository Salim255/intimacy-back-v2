import { Test, TestingModule } from '@nestjs/testing';
import { ChatsController } from './chats.controller';
import { ChatsService } from '../services/chats.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserKeysService } from '../../user-keys/services/user-keys.service';
import { CreateChatDto } from '../chat-dto/chat-response.dto';

const mockChatService = {
  createFullChat: jest.fn(),
};

describe('ChatsController', () => {
  let controller: ChatsController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatsController],
      providers: [
        {
          provide: ChatsService,
          useValue: mockChatService, // Mock ChatsService if needed
        },
        {
          provide: UserKeysService,
          useValue: {}, // Mock UserKeysService if needed
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<ChatsController>(ChatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a new chat', async () => {
    // Arrange
    const body: CreateChatDto = {
      content: 'Hello',
      to_user_id: 1,
      from_user_id: 3,
      session_key_receiver: 'R_key',
      session_key_sender: 'S_key',
    };

    const createdChatDetails = {
      id: 1,
      type: 'dual',
      created_at: '2025-04-16T09:51:29.904Z',
      updated_at: '2025-04-16T09:51:29.904Z',
      no_read_messages: 1,
      encrypted_session_base64: null,
      users: [
        {
          avatar: null,
          user_id: 3,
          is_admin: true,
          last_name: 'Salim',
          first_name: 'Salim',
          connection_status: 'offline',
        },
        {
          avatar: null,
          user_id: 3,
          is_admin: false,
          last_name: 'Hassan',
          first_name: 'Hassan',
          connection_status: 'offline',
        },
      ],
      messages: [
        {
          id: 1,
          status: 'sent',
          chat_id: 1,
          content: 'Hello',
          created_at: '2025-04-16T09:51:29.982555+00:00',
          to_user_id: 1,
          updated_at: '2025-04-16T09:51:29.982555+00:00',
          from_user_id: 3,
        },
      ],
    };
    mockChatService.createFullChat.mockResolvedValue(createdChatDetails);
    // Act
    const response = await controller.createChat(body);

    // Assert
    expect(mockChatService.createFullChat).toHaveBeenCalledTimes(1);
    expect(response.data.chat).toEqual(createdChatDetails);
    expect(response.status).toEqual('Success');
  });
});
