import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repository/user.repository';
import { UserDto } from '../user-dto/update-user-dto';
import { DataSource } from 'typeorm';
import { UserKeysService } from '../../user-keys/services/user-keys.service';
import * as passwordHandler from '../../auth/password-handler';
import { JwtTokenService, JwtTokenPayload } from '../../auth/jws-token-service';
import { PasswordComparisonPayload } from '../../auth/password-handler';

export type UpdateUserPayload = {
  userId: number;
  query: string;
  values: (string | number | boolean | null)[];
};

export type CreateUserPayload = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  private_key: string;
  public_key: string;
};

export type LoginUserPayload = {
  email: string;
  password: string;
};

export type CreateUserResponse = {
  token: string;
  id: number;
  expireIn: number;
  privateKey: string;
  publicKey: string;
  email: string;
};

export type LoginUserResponse = CreateUserResponse;

@Injectable()
export class UsersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userKeysService: UserKeysService,
    private readonly userRepository: UserRepository,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async signup(
    createUserPayload: CreateUserPayload,
  ): Promise<CreateUserResponse> {
    const queryRunning = this.dataSource.createQueryRunner();
    await queryRunning.connect();
    await queryRunning.startTransaction();
    try {
      const hashedPassword = await passwordHandler.hashedPassword(
        createUserPayload.password,
      );
      // Step: 1 - Create the user
      const createdUser: User = await this.userRepository.insert({
        first_name: createUserPayload.first_name,
        last_name: createUserPayload.first_name,
        email: createUserPayload.email,
        password: hashedPassword,
      });

      // Step: 2 - Create the user keys
      const userKeys = await this.userKeysService.createUserKeys({
        user_id: createdUser.id,
        public_key: createUserPayload.public_key,
        encrypted_private_key: createUserPayload.private_key,
      });

      // Step: 3 - Prepare token
      const token = this.jwtTokenService.createToken(createdUser.id);
      const tokenDetails: JwtTokenPayload =
        this.jwtTokenService.verifyToken(token);

      // Step: 4 - Commit the transaction
      await queryRunning.commitTransaction();

      // Step: 5 - Release the query runner
      await queryRunning.release();

      // Prepare the response
      const response: CreateUserResponse = {
        token,
        id: Number(tokenDetails.id),
        expireIn: tokenDetails.exp,
        privateKey: userKeys.encrypted_private_key,
        publicKey: userKeys.public_key,
        email: createdUser.email,
      };
      return response;
    } catch (error) {
      // Rollback the transaction in case of error
      await queryRunning.rollbackTransaction();
      // Release the query runner
      await queryRunning.release();

      const messError = error instanceof Error ? error.message : '';
      throw new HttpException(
        {
          status: 'fail',
          message: 'User creation failed: ' + messError,
          code: 'USER_CREATION_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(loginUserPayload: LoginUserPayload): Promise<LoginUserResponse> {
    try {
      // Step: 1 - Check if user exists
      const user = await this.userRepository.getUser(loginUserPayload.email);
      if (!user) {
        throw new HttpException(
          {
            status: 'fail',
            message: 'User not found',
            code: 'USER_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      // Step: 2 - Check if password is correct
      const passwords: PasswordComparisonPayload = {
        plainPassword: loginUserPayload.password,
        hashedPassword: user.password,
      };
      const isPasswordValid = await passwordHandler.correctPassword(passwords);
      if (!isPasswordValid) {
        throw new HttpException(
          {
            status: 'fail',
            message: 'Invalid password',
            code: 'INVALID_PASSWORD',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      // Step: 3 - Prepare token
      const token = this.jwtTokenService.createToken(user.id);
      const tokenDetails: JwtTokenPayload =
        this.jwtTokenService.verifyToken(token);

      // Step: 4 - Prepare the response
      const response: CreateUserResponse = {
        token,
        id: Number(tokenDetails.id),
        expireIn: tokenDetails.exp,
        privateKey: user.encrypted_private_key,
        publicKey: user.public_key,
        email: user.email,
      };
      // Step: 5 - Return the response
      return response;
    } catch (error) {
      console.error(error);
      const messageError = error instanceof Error ? error.message : '';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error to log user: ' + messageError,
          code: 'LOGGING_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserById(userId: number): Promise<UserDto> {
    try {
      const user: User = await this.userRepository.getUserById(userId);
      if (!user) {
        throw new HttpException(
          {
            status: 'fail',
            message: 'User not found or no longer exists.',
            code: 'USER_NOT_FOUND',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      const userDto: UserDto = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        connection_status: user.connection_status,
        avatar: user.avatar,
      };
      return userDto;
    } catch (error) {
      const messageError = error instanceof Error ? error.message : '';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error with getting user: ' + messageError,
          code: 'GETTING_USER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async countUsers(): Promise<number> {
    try {
      const count = await this.userRepository.count();
      return count;
    } catch (error) {
      throw new Error(`Error in count users: ${error}`);
    }
  }
  async disableUser(userId: number) {
    try {
      const disabledUser = await this.userRepository.disableUser(userId);
      return disabledUser;
    } catch (error) {
      throw new Error(`Error in disable user: ${error}`);
    }
  }

  async updateUser(updateUserPayload: UpdateUserPayload): Promise<UserDto> {
    try {
      // 1- Check is user exit
      const savedUser: UserDto = await this.getUserById(
        updateUserPayload.userId,
      );

      if (!savedUser) {
        throw new HttpException(
          {
            status: 'fail',
            message: 'User not found or no longer exists.',
            code: 'USER_NOT_FOUND',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // 2- If no fields to update, return early
      if (updateUserPayload.values.length === 0) {
        return savedUser;
        // No changes, return existing data
      }

      // 3- Update user
      const updatedUser: User = await this.userRepository.updateUser(
        updateUserPayload.query,
        updateUserPayload.values,
      );

      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      throw new HttpException(
        {
          status: 'fail',
          message: 'fail to update ' + errorMessage,
          code: 'UPDATE_ME_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async updateUserConnectionStatus(
    userId: number,
    connectionStatus: string,
  ): Promise<User> {
    try {
      const updatedUser = await this.userRepository.updateUserConnectionStatus(
        userId,
        connectionStatus,
      );
      return updatedUser;
    } catch (error) {
      throw new Error(`Error in update user connection status: ${error}`);
    }
  }
}
