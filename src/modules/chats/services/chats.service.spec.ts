import { Test, TestingModule } from '@nestjs/testing';
import { ChatsService, CreateChatPayload } from './chats.service';
import { PartnerConnectionStatus } from '../../../modules/messages/message-dto/message-dto';
import { ChatRepository } from '../repository/chat.repository';
import { DataSource } from 'typeorm';
import { MessageService } from '../../../modules/messages/services/message.service';
import { ChatUsersService } from '../../../modules/chat-users/services/chat-users.service';
import { SessionKaysService } from '../../../modules/session-keys/services/session-kays.service';
import { HttpException } from '@nestjs/common';

const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
};
const mockDataSource = {
  createQueryRunner: jest.fn(() => mockQueryRunner),
};
const mockChatsRepository = {
  insert: jest.fn(),
  getChatDetailsByChatIdUserId: jest.fn(),
  incrementMessageCounter: jest.fn(),
};

const mockMessageService = {
  createMessage: jest.fn(),
};

const mockChatUsersService = {
  addUserToChat: jest.fn(),
};

const mockSessionKeysService = {
  createSessionKeys: jest.fn(),
};

describe('ChatsService', () => {
  let service: ChatsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatsService,
        {
          provide: ChatRepository,
          useValue: mockChatsRepository,
        },
        {
          provide: MessageService,
          useValue: mockMessageService, // Mock MessageService if needed
        },
        {
          provide: ChatUsersService,
          useValue: mockChatUsersService, // Mock ChatUsersService if needed
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: SessionKaysService,
          useValue: mockSessionKeysService,
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
          name: 'Salim',
          connection_status: 'offline',
        },
        {
          avatar: null,
          user_id: 1,
          is_admin: false,
          name: 'Hassan',
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

    mockChatsRepository.insert.mockResolvedValue(createChatPayload);
    mockChatsRepository.getChatDetailsByChatIdUserId.mockResolvedValue(
      createdChatDetails,
    );
    // Act
    const createdChatResponse = await service.createFullChat(createChatPayload);
    // Assert
    expect(
      mockChatsRepository.getChatDetailsByChatIdUserId,
    ).toHaveBeenCalledTimes(1);
    expect(createdChatResponse).toEqual(createdChatDetails);
  });

  it('should rollback and throw an error if chat creation fails', async () => {
    // Arrange
    const createChatPayload: CreateChatPayload = {
      content: 'Hello there',
      from_user_id: 2,
      to_user_id: 1,
      session_key_receiver: 'key1',
      session_key_sender: 'key2',
      partner_connection_status: PartnerConnectionStatus.ONLINE,
    };
    const errorMessage = 'Database insert failed';
    // Simulate a failure in the chat creation step
    mockChatsRepository.insert.mockRejectedValue(new Error(errorMessage));

    // Act
    let caughtError;
    try {
      await service.createFullChat(createChatPayload);
    } catch (err) {
      caughtError = err as Error;
    }

    expect(caughtError).toBeInstanceOf(HttpException);
    expect(caughtError).toMatchObject({
      response: {
        status: 'fail',
        message: `Error creating chat: ${errorMessage}`,
        code: 'CHAT_CREATION_ERROR',
      },
      status: 500,
    });
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
  });

  afterEach(() => {
    // Optionally add safety checks here
    jest.clearAllMocks();
  });
});
