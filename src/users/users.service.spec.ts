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

  it('should create user successful', () => {
    mockUserRepository.getUser.mockResolvedValue(null);
    mockUserRepository.insert.mockRejectedValue({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'hashedpassword',
      isStaff: false,
    });

    const result = service.createUser({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'plaintextpassword',
      isStaff: false,
    });
    expect(result).toHaveProperty('id', 1);
  });
});
