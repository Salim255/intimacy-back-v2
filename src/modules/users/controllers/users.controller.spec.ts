import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../user-dto/create-user-dto';
import { CreateUserResponseDto } from '../user-dto/create-user-response-dto';
import { NextFunction, Response, Request } from 'express';
import { UserKeysService } from '../../user-keys/services/user-keys.service';
import { JwtTokenService } from '../../../utils/jws-token-service';
import * as passwordHandler from '../../../utils/password-handler';

// Ensure this path is correct and TestContext is properly exported and typed
const mockUsersService = {
  createUser: jest.fn(),
};

const mockUserKeysService = {
  createUserKeys: jest.fn(),
};

const mockJwtTokenService = {
  createToken: jest.fn(),
  verifyToken: jest.fn(),
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

      const req = {
        body: createUserDto,
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response & {
        status: jest.Mock;
        json: jest.Mock;
      };

      const next = jest.fn() as NextFunction;
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
      await controller.signup(res, req, next);

      // Assert: Check the result
      expect(mockUsersService.createUser).toHaveBeenCalledWith({
        email: createUserDto.email,
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        public_key: createUserDto.public_key,
        private_key: createUserDto.private_key,
        password: mockedHashedPassword,
      });
      expect(mockUsersService.createUser).toHaveBeenCalledTimes(1);
      expect(res.json.mock.calls[0][0]).toEqual(createdUserResponse);
      expect(res.json.mock.calls[0][0].status).toBe('success');
      expect(res.json).toHaveBeenCalledWith(createdUserResponse);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockUserKeysService.createUserKeys).toHaveBeenCalledWith({
        user_id: createdUserResponse.data.id,
        public_key: createUserDto.public_key,
        encrypted_private_key: createUserDto.private_key,
      });

      // Verify that the user service was called with the correct data
      expect(mockUsersService.createUser).toHaveBeenCalledWith({
        ...createUserDto,
        password: mockedHashedPassword,
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
});
