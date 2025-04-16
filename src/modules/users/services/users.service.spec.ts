import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from '../repository/user.repository';
import { DataSource } from 'typeorm';
import { JwtTokenService } from '../../auth/jws-token-service';
import { UserKeysService } from '../../user-keys/services/user-keys.service';

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
const mockUserRepository = {
  getUser: jest.fn(),
  getUserById: jest.fn(),
  insert: jest.fn(),
  count: jest.fn(),
  disableUser: jest.fn(),
  updateUser: jest.fn(),
  updateUserConnectionStatus: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: DataSource, useValue: mockDataSource },
        {
          provide: JwtTokenService,
          useValue: {
            createToken: jest.fn(),
            verifyToken: jest.fn(),
          },
        },
        {
          provide: UserKeysService,
          useValue: {
            createUserKeys: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create user successful', async () => {
    mockUserRepository.getUser.mockResolvedValue(null);
    mockUserRepository.insert.mockResolvedValue({
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'test@example.com',
      password: 'hashedpassword',
    });

    const result = await service.signup({
      first_name: 'John',
      last_name: 'Doe',
      email: 'test@example.com',
      password: 'plaintextpassword',
      public_key: 'publickey',
      private_key: 'privatekey',
    });
    expect(result).toHaveProperty('id', 1);
    expect(result).toHaveProperty('email', 'test@example.com');
    expect(mockUserRepository.insert).toHaveBeenCalled();
  });

  it('should get user with email and password', async () => {
    mockUserRepository.getUser.mockResolvedValue({
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
    });

    const user = await service.login({ email: 'email', password: 'password' });
    expect(user).toHaveProperty('id', 1);
    expect(mockUserRepository.getUser).toHaveBeenCalled();
  });

  it('should fetch user by user id', async () => {
    mockUserRepository.getUserById.mockResolvedValue({
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
    });
    const userId = 1;
    const user = await service.getUserById(userId);
    expect(user).toHaveProperty('id', 1);
    expect(mockUserRepository.getUserById).toHaveBeenCalled();
  });

  it('should count the number of users', async () => {
    mockUserRepository.count.mockResolvedValue(1);
    const userCount = await service.countUsers();
    expect(userCount).toEqual(1);
    expect(mockUserRepository.count).toHaveBeenCalled();
  });

  it('should disable user', async () => {
    mockUserRepository.disableUser.mockResolvedValue({
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      isStaff: false,
      is_active: false,
    });

    const userId = 1;
    const disabledUser = await service.disableUser(userId);
    expect(disabledUser).toHaveProperty('id', 1);
    expect(disabledUser.is_active).toEqual(false);
    expect(mockUserRepository.disableUser).toHaveBeenCalled();
  });

  it('should update user ', async () => {
    const query = 'UPDATE users SET first_name = $1 WHERE id = $2 RETURNING *;';
    const values = ['UpdatedName', 1];
    mockUserRepository.updateUser.mockResolvedValue({
      id: 1,
      first_name: 'UpdatedName',
      last_name: 'Doe',
      email: 'test@example.com',
      password: 'hashedpassword',
      isStaff: false,
    });
    const updatedUser = await service.updateUser(query, values);
    expect(updatedUser).toHaveProperty('id', 1);
    expect(updatedUser.first_name).toEqual('UpdatedName');
    expect(mockUserRepository.updateUser).toHaveBeenCalled();
  });

  it('should update user connection status', async () => {
    mockUserRepository.updateUserConnectionStatus.mockResolvedValue({
      id: 1,
      first_name: 'UpdatedName',
      last_name: 'Doe',
      avatar: null,
      connection_status: true,
    });

    const result = await service.updateUserConnectionStatus(1, 'offline');
    expect(result).toHaveProperty('id', 1);
    expect(result.connection_status).toEqual(true);
    expect(mockUserRepository.updateUserConnectionStatus).toHaveBeenCalled();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
