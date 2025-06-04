import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../user-dto/create-user-dto';
import {
  CreateUserResponseDto,
  LoginUserResponseDto,
} from '../user-dto/create-user-response-dto';
import { LoginUserDto } from '../user-dto/login-user-dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FileUploadModule } from '../../../common/file-upload/file-upload.module';
import { UploadToS3Interceptor } from '../../../common/file-upload/interceptors/upload-to-s3.interceptor';

// Ensure this path is correct and TestContext is properly exported and typed
const mockUsersService = {
  signup: jest.fn(),
  login: jest.fn(),
  updateUser: jest.fn(),
  getUserById: jest.fn(),
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
        token: 'your.jwt.token.here',
        id: 1,
        expireIn: 1609459200,
        privateKey: 'encryptedPrivateKeyHere',
        publicKey: 'publicKeyHere',
        email: 'test@example.com',
      });

      //  Act: call the controller method
      const result = await controller.signup(createUserDto);

      // Assert: Check the result
      expect(mockUsersService.signup).toHaveBeenCalledTimes(1);
      expect(result).toEqual(createdUserResponse);
      expect(result.status).toBe('success');
    });
  });

  it('should login a user in and return logged user', async () => {
    // arrange
    const userLoginRequest: LoginUserDto = {
      email: 's@gmail.com',
      password: '123',
    };

    const userLoggingResponse: LoginUserResponseDto = {
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

    mockUsersService.login.mockResolvedValue({
      token: 'your.jwt.token.here',
      id: 1,
      expireIn: 1609459200,
      privateKey: 'encryptedPrivateKeyHere',
      publicKey: 'publicKeyHere',
      email: 's@gmail.com',
    });

    // Act
    const result = await controller.login(userLoginRequest);

    // Assert
    expect(mockUsersService.login).toHaveBeenCalledTimes(1);
    expect(result).toEqual(userLoggingResponse);
    expect(result.status).toEqual('success');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
