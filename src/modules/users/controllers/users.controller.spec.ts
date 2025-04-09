import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../user-dto/create-user-dto';
import { CreateUserResponseDto } from '../user-dto/create-user-response-dto';
import { UserKeysService } from '../../user-keys/services/user-keys.service';
import { JwtTokenService } from '../../../utils/jws-token-service';
import * as passwordHandler from '../../../utils/password-handler';
import { DataSource } from 'typeorm';
import { LoginUserDto } from '../user-dto/login-user-dto';

// Ensure this path is correct and TestContext is properly exported and typed
const mockUsersService = {
  createUser: jest.fn(),
  getUser: jest.fn(),
};

const mockUserKeysService = {
  createUserKeys: jest.fn(),
};

const mockJwtTokenService = {
  createToken: jest.fn(),
  verifyToken: jest.fn(),
};

const mockDataSource = {
  options: { url: 'mock-db-url' },
  query: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: UserKeysService,
          useValue: mockUserKeysService,
        },
        {
          provide: JwtTokenService,
          useValue: mockJwtTokenService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should return created user response', async () => {
      // Arrange: Set up the necessary data and mocks
      const createUserDto: CreateUserDto = {
        first_name: 'John',
        last_name: 'Doe',
        password: 'password123',
        email: 'user@example.com',
        public_key: 'publicKeyHere',
        private_key: 'encryptedPrivateKeyHere',
      };
      const createdUserResponse: CreateUserResponseDto = {
        status: 'success',
        data: {
          token: 'your.jwt.token.here',
          id: 1,
          expireIn: 1609459200,
          privateKey: 'encryptedPrivateKeyHere',
          publicKey: 'publicKeyHere',
          email: 'test@example.com',
        },
      };

      // Mock the request and response objects
      // Act: Call the method being tested
      mockUsersService.createUser.mockResolvedValue({
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'test@example.com',
      });
      // Mock the user creation (with hashed password)
      const mockedHashedPassword =
        '$2b$12$kx3DE7LCnZHsCQGZ2mI/suLcreVpOPLh4nCqIOQ7P0aZdr8jvPlku'; // Mock hashed password

      // Mock passwordHandler.hashedPassword to avoid actual password hashing
      jest
        .spyOn(passwordHandler, 'hashedPassword')
        .mockResolvedValue(mockedHashedPassword);

      // Mock user keys service
      mockUserKeysService.createUserKeys.mockResolvedValue({
        public_key: 'publicKeyHere',
        encrypted_private_key: 'encryptedPrivateKeyHere',
      });

      // Mock JwtTokenService methods
      mockJwtTokenService.createToken.mockReturnValue('your.jwt.token.here');
      mockJwtTokenService.verifyToken.mockReturnValue({
        id: 1,
        exp: 1609459200,
      });

      // Call the controller method
      const result = await controller.signup(createUserDto);

      // Assert: Check the result
      expect(mockUsersService.createUser).toHaveBeenCalledWith({
        email: createUserDto.email,
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        password: mockedHashedPassword,
      });
      expect(mockUsersService.createUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(createdUserResponse);
      expect(result.status).toBe('success');
      expect(mockUserKeysService.createUserKeys).toHaveBeenCalledWith({
        user_id: createdUserResponse.data.id,
        public_key: createUserDto.public_key,
        encrypted_private_key: createUserDto.private_key,
      });
      expect(mockUserKeysService.createUserKeys).toHaveBeenCalledTimes(1);
      expect(mockJwtTokenService.createToken).toHaveBeenCalledWith(
        createdUserResponse.data.id,
      );
      expect(mockJwtTokenService.verifyToken).toHaveBeenCalledWith(
        'your.jwt.token.here',
      );
    });
  });

  it('should log a user in and return logged user', async () => {
    // arrange
    const userLoginRequest: LoginUserDto = {
      email: 's@gmail.com',
      password: '123',
    };

    const user = {
      id: 1,
      email: 's@gmail.com',
      password: 'hashedPassword',
      encrypted_private_key: 'encryptedPrivateKeyHere',
      public_key: 'publicKeyHere',
    };

    const userLoggingResponse: CreateUserResponseDto = {
      status: 'success',
      data: {
        token: 'your.jwt.token.here',
        id: 1,
        expireIn: 1609459200,
        privateKey: 'encryptedPrivateKeyHere',
        publicKey: 'publicKeyHere',
        email: 's@gmail.com',
      },
    };

    mockUsersService.getUser.mockResolvedValue(user);
    // Spy password verification
    jest.spyOn(passwordHandler, 'correctPassword').mockResolvedValue(true);

    // Mock token verification
    mockJwtTokenService.verifyToken.mockReturnValue({
      id: 1,
      exp: 1609459200,
    });

    // Act
    const result = await controller.login(userLoginRequest);

    // Assert
    expect(mockUsersService.getUser).toHaveBeenCalledTimes(1);
    expect(result).toEqual(userLoggingResponse);
    expect(result.status).toEqual('success');
    expect(mockJwtTokenService.verifyToken).toHaveBeenCalledWith(
      'your.jwt.token.here',
    );
  });
});
