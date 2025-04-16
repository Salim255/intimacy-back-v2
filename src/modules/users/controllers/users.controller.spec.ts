import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../user-dto/create-user-dto';
import { CreateUserResponseDto } from '../user-dto/create-user-response-dto';
import { UserKeysService } from '../../user-keys/services/user-keys.service';
import { JwtTokenService } from '../../auth/jws-token-service';
import * as passwordHandler from '../../auth/password-handler';
import { DataSource } from 'typeorm';
import { LoginUserDto } from '../user-dto/login-user-dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UpdateUserDto, UserDto } from '../user-dto/update-user-dto';
import { Request } from 'express';
import { FileUploadModule } from '../../../common/file-upload/file-upload.module';
import { UploadToS3Interceptor } from '../../../common/file-upload/interceptors/upload-to-s3.interceptor';

// Ensure this path is correct and TestContext is properly exported and typed
const mockUsersService = {
  signup: jest.fn(),
  getUser: jest.fn(),
  updateUser: jest.fn(),
  getUserById: jest.fn(),
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
      imports: [FileUploadModule],
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
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true), // Always allow
      })
      .overrideInterceptor(UploadToS3Interceptor)
      .useValue({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        intercept: jest.fn((ctx, next) => next.handle()), // simply passes through
      }) // simply passes through)
      .compile();

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
      mockUsersService.signup.mockResolvedValue({
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
      expect(mockUsersService.signup).toHaveBeenCalledWith({
        email: createUserDto.email,
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        password: mockedHashedPassword,
      });
      expect(mockUsersService.signup).toHaveBeenCalledTimes(1);
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
    expect(result.data.id).toEqual(userLoggingResponse.data.id);
    expect(result.status).toEqual('success');
    expect(mockJwtTokenService.verifyToken).toHaveBeenCalledWith(
      'your.jwt.token.here',
    );
  });

  it('should update user', async () => {
    // Arrange
    const userInput: UpdateUserDto = { last_name: 'Harron' };
    const updatedUser: UserDto = {
      id: 1,
      last_name: 'Harron',
      first_name: 'Hassan',
      avatar: 'avatar',
      connection_status: 'online',
    };
    mockUsersService.updateUser.mockResolvedValue(updatedUser);
    mockUsersService.getUserById.mockResolvedValue(UpdateUserDto);
    const req = {
      user: { id: 1 },
    } as Partial<Request> as Request;

    const file = undefined as unknown as Express.Multer.File;
    // Act
    const result = await controller.updateMe(userInput, file, req);

    // Assert
    expect(mockUsersService.updateUser).toHaveBeenCalledTimes(1);
    expect(mockUsersService.getUserById).toHaveBeenCalledTimes(1);
    expect(mockUsersService.getUserById).toHaveBeenCalledWith(1);
    expect(result.status).toEqual('success');
    expect(result.data.user.id).toEqual(updatedUser.id);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
