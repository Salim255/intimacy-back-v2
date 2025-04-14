import { Test, TestingModule } from '@nestjs/testing';
import { UserKeysService } from './user-keys.service';
import { UserKeysType } from '../repository/user-keys.repository';

const mockUserKeysService = {
  createUserKeys: jest.fn(),
};

describe('UserKeysService', () => {
  let service: UserKeysService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserKeysService,
          useValue: mockUserKeysService,
        },
      ],
    }).compile();

    service = module.get<UserKeysService>(UserKeysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call createUserKeys', async () => {
    // Arrange
    const userKeysPayload: UserKeysType = {
      user_id: 1,
      public_key: 'publicKey',
      encrypted_private_key: 'encryptedPrivateKey',
    };
    const createUserKeysResponse = {
      public_key: userKeysPayload.public_key,
      encrypted_private_key: userKeysPayload.encrypted_private_key,
    };
    mockUserKeysService.createUserKeys.mockResolvedValue(
      createUserKeysResponse,
    );
    // Act
    const result = await service.createUserKeys(userKeysPayload);

    // Assert
    expect(mockUserKeysService.createUserKeys).toHaveBeenCalled();
    expect(result).toEqual(createUserKeysResponse);
    expect(mockUserKeysService.createUserKeys).toHaveBeenCalledWith(
      userKeysPayload,
    );
    expect(mockUserKeysService.createUserKeys).toHaveBeenCalledTimes(1);
  });
});
