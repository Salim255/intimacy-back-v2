import { Test, TestingModule } from '@nestjs/testing';
import { SessionKaysService } from './session-kays.service';
import {
  CreatedSessionResponseDto,
  CreateSessionDto,
} from '../session-keys-dto/session-key-dto';

const mockSessionKeysService = {
  createSessionKeys: jest.fn(),
};

describe('SessionKaysService', () => {
  let service: SessionKaysService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SessionKaysService,
          useValue: mockSessionKeysService,
        },
      ],
    }).compile();

    service = module.get<SessionKaysService>(SessionKaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create sessionKeys', async () => {
    // Arrange
    const creationPayload: CreateSessionDto = {
      chat_id: 1,
      sender_id: 2,
      receiver_id: 1,
      encrypted_session_for_sender: 'sender_key',
      encrypted_session_for_receiver: 'receiver kay',
    };

    const createdKeys: CreatedSessionResponseDto = {
      chat_id: 1,
      sender_id: 1,
      receiver_id: 2,
      encrypted_session_for_sender: 'sender_key',
      encrypted_session_for_receiver: 'receiver_key',
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Act
    mockSessionKeysService.createSessionKeys.mockResolvedValue(createdKeys);

    const result: CreatedSessionResponseDto =
      await service.createSessionKeys(creationPayload);
    // Assert
    expect(result).toEqual(createdKeys);
    expect(mockSessionKeysService.createSessionKeys).toHaveBeenCalled();
    expect(mockSessionKeysService.createSessionKeys).toHaveBeenCalledTimes(1);
    expect(mockSessionKeysService.createSessionKeys).toHaveBeenCalledWith(
      creationPayload,
    );
  });
});
