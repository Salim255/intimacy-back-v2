import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from './user.repository';

const mockUserRepository = {
  getUser: jest.fn(),
  insert: jest.fn(),
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
  });
});
