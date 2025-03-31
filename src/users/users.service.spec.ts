import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from './user.repository';

const mockUserRepository = {
  getUser: jest.fn(),
  getUserById: jest.fn(),
  insert: jest.fn(),
  count: jest.fn(),
  disableUser: jest.fn(),
  updateUser: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should create user successful', async () => {
    mockUserRepository.getUser.mockResolvedValue(null);
    mockUserRepository.insert.mockResolvedValue({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'hashedpassword',
      isStaff: false,
    });

    const result = await service.createUser({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'plaintextpassword',
      isStaff: false,
    });
    expect(result).toHaveProperty('id', 1);
    expect(result).toHaveProperty('email', 'test@example.com');
    expect(mockUserRepository.insert).toHaveBeenCalled();
  });

  it('should get user with email and password', async () => {
    mockUserRepository.getUser.mockResolvedValue({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      isStaff: false,
    });

    const user = await service.getUser('email');
    expect(user).toHaveProperty('id', 1);
    expect(mockUserRepository.getUser).toHaveBeenCalled();
  });

  it('should fetch user by user id', async () => {
    mockUserRepository.getUserById.mockResolvedValue({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      isStaff: false,
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
      firstName: 'John',
      lastName: 'Doe',
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
    mockUserRepository.updateUser.mockResolvedValue({
      id: 1,
      firstName: 'UpdatedName',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'hashedpassword',
      isStaff: false,
    });
    const updatedUser = await service.updateUser();
    expect(updatedUser).toHaveProperty('id', 1);
    expect(updatedUser.firstName).toEqual('UpdatedName');
    expect(mockUserRepository.updateUser).toHaveBeenCalled();
  });
});
