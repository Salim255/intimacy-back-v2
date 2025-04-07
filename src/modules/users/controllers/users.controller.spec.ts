import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../user-dto/create-user-dto';
import { CreateUserResponseDto } from '../user-dto/create-user-response-dto';
// Ensure this path is correct and TestContext is properly exported and typed
const mockUsersService = {
  signup: jest.fn(),
};
describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should return created suer response', async () => {
      // Arrange: Set up the necessary data and mocks
      const createUserDto: CreateUserDto = {
        first_name: 'John',
        last_name: 'Doe',
        password: 'password123',
        email: 'user@example.com',
      };
      const createdUserResponse: CreateUserResponseDto = {
        status: 'success',
        data: {
          token: 'your.jwt.token.here',
          id: 123,
          expireIn: 1609459200,
          privateKey: 'encryptedPrivateKeyHere',
          publicKey: 'publicKeyHere',
          email: 'user@example.com',
        },
      };

      // Act: Call the method being tested
      mockUsersService.signup.mockResolvedValue(createdUserResponse);

      const result = await controller.signup();
      console.log(result);
      // Assert: Check the result
      expect(result).toBe('hello from signup');
    });
  });
});
