import { Test, TestingModule } from '@nestjs/testing';
import { ChatsService, CreateChatPayload } from './chats.service';
import { PartnerConnectionStatus } from '../../../modules/messages/message-dto/message-dto';

const mockChatService = {
  createFullChat: jest.fn(),
};

describe('ChatsService', () => {
  let service: ChatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ChatsService,
          useValue: mockChatService,
        },
      ],
    }).compile();

    service = module.get<ChatsService>(ChatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a chat', async () => {
    // Arrange
    const createChatPayload: CreateChatPayload = {
      content: 'Hello there',
      from_user_id: 2,
      to_user_id: 1,
      session_key_receiver: 'key1',
      session_key_sender: 'key2',
      partner_connection_status: PartnerConnectionStatus.ONLINE,
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
          user_id: 2,
          is_admin: true,
          last_name: 'Salim',
          first_name: 'Salim',
          connection_status: 'offline',
        },
        {
          avatar: null,
          user_id: 1,
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
          content: 'Hello there',
          created_at: '2025-04-16T09:51:29.982555+00:00',
          to_user_id: 1,
          updated_at: '2025-04-16T09:51:29.982555+00:00',
          from_user_id: 2,
        },
      ],
    };

    mockChatService.createFullChat.mockResolvedValue(createdChatDetails);
    // Act
    const createdChatResponse = await service.createFullChat(createChatPayload);

    // Assert
    expect(mockChatService.createFullChat).toHaveBeenCalledTimes(1);
    expect(mockChatService.createFullChat).toHaveBeenCalledWith(
      createChatPayload,
    );
    expect(createdChatResponse).toEqual(createdChatDetails);
  });
});
