import { Test, TestingModule } from '@nestjs/testing';
import {
  ChatsService,
  CreateChatPayload,
  UpdateChatCounterPayload,
} from './chats.service';
import { ChatRepository } from '../repository/chat.repository';
import { MessageService } from '../../messages/services/message.service';
import { ChatUsersService } from '../../chat-users/services/chat-users.service';
import { DataSource } from 'typeorm';

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

const mockChatUsersService = {
  addUserToChat: jest.fn(),
};

const mockMessageService = {
  createMessage: jest.fn(),
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
    };

    const createMessagePayload = {
      content: 'Hello there',
      fromUserId: 2,
      toUserId: 1,
      chatId: 1,
      status: 'sent',
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

    const createdChat = {
      id: 1,
      type: 'dual',
      created_at: 'created_at',
      updated_at: 'updated_at',
      no_read_messages: 1,
    };
    mockChatsRepository.insert.mockResolvedValue(createdChat);

    mockChatUsersService.addUserToChat.mockResolvedValue({
      id: 1,
      created_at: 'Date',
      updated_at: 'Date',
      user_id: 1,
      chat_id: 1,
      is_admin: false,
    });

    mockMessageService.createMessage.mockResolvedValue({
      id: 1,
      created_at: 'created_at',
      updated_at: 'Updated_at',
      content: 'Hello there',
      from_user_id: 2,
      to_user_id: 1,
      status: 'sent',
      chat_id: 1,
    });

    mockChatsRepository.getChatDetailsByChatIdUserId.mockResolvedValue(
      createdChatDetails,
    );
    // Act
    const createdChatResponse = await service.createFullChat(createChatPayload);

    // Assert
    expect(mockChatsRepository.insert).toHaveBeenCalledWith();
    expect(mockChatsRepository.insert).toHaveBeenCalledTimes(1);
    expect(mockChatUsersService.addUserToChat).toHaveBeenCalledTimes(2);
    expect(mockMessageService.createMessage).toHaveBeenCalledTimes(1);
    expect(mockMessageService.createMessage).toHaveBeenCalledWith(
      createMessagePayload,
    );
    expect(
      mockChatsRepository.getChatDetailsByChatIdUserId,
    ).toHaveBeenCalledWith({ chatId: 1, userId: 2 });
    expect(
      mockChatsRepository.getChatDetailsByChatIdUserId,
    ).toHaveBeenCalledTimes(1);
    expect(createdChatResponse).toEqual(createdChatDetails);
    expect(mockDataSource.createQueryRunner).toHaveBeenCalled();
    expect(mockQueryRunner.connect).toHaveBeenCalled();
    expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });

  it('should update chat counter', async () => {
    // Arrange
    const updateChatCounterPayload: UpdateChatCounterPayload = {
      chatId: 1,
      updateType: 'increment',
    };
    mockChatsRepository.incrementMessageCounter.mockResolvedValue({
      id: 1,
      type: 'dual',
      created_at: 'created_at',
      updated_at: 'updated_at',
      no_read_messages: 2,
    });

    // Act
    const result = await service.updateChatCounter(updateChatCounterPayload);

    // Assert
    expect(mockChatsRepository.incrementMessageCounter).toHaveBeenCalledWith(1);
    expect(mockChatsRepository.incrementMessageCounter).toHaveBeenCalledTimes(
      1,
    );
    expect(result.no_read_messages).toEqual(2);
  });
});
