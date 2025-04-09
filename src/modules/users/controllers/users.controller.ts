import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from '../user-dto/create-user-dto';
import { CreateUserResponseDto } from '../user-dto/create-user-response-dto';
import { LoginUserDto } from '../user-dto/login-user-dto';
import { UpdateUserDto } from '../user-dto/update-user-dto';
import * as passwordHandler from '../../../utils/password-handler';
import { UserKeysService } from '../../user-keys/services/user-keys.service';
import {
  JwtTokenService,
  JwtTokenPayload,
} from '../../../utils/jws-token-service';
import { DataSource } from 'typeorm';
import { PasswordComparisonPayload } from '../../../utils/password-handler';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly userKeysService: UserKeysService,
    private readonly usersService: UsersService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly dataSource: DataSource, // Inject the DataSource here
  ) {
    console.log('UsersController initialized'); // Log controller initialization
  }

  @Post('signup')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new you user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: CreateUserResponseDto,
  })
  async signup(@Body() body: CreateUserDto) {
    //const ds = this.dataSource; // inject it
    //console.log('🧪 Current DB URL', ds.options['url']);
    try {
      const {
        email,
        password,
        first_name,
        last_name,
        private_key,
        public_key,
      } = body;

      const hashedPassword = await passwordHandler.hashedPassword(password);
      const createdUser = await this.usersService.createUser({
        email,
        password: hashedPassword,
        first_name,
        last_name,
      });

      // Create usr keys
      const userKeys = await this.userKeysService.createUserKeys({
        user_id: createdUser.id,
        public_key,
        encrypted_private_key: private_key,
      });
      const token = this.jwtTokenService.createToken(createdUser.id);

      const tokenDetails: JwtTokenPayload =
        this.jwtTokenService.verifyToken(token);

      return {
        status: 'success',
        data: {
          token,
          id: tokenDetails.id,
          expireIn: tokenDetails.exp,
          privateKey: userKeys.encrypted_private_key,
          publicKey: userKeys.public_key,
          email: createdUser.email,
        },
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '';
      throw new HttpException(
        {
          status: 'fail',
          message: 'User creation failed: ' + errorMessage,
          code: 'USER_CREATE_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 200,
    description: 'User logged successfully',
    type: CreateUserResponseDto,
  })
  async login(@Body() body: LoginUserDto): Promise<CreateUserResponseDto> {
    try {
      const { email, password } = body;
      const user = await this.usersService.getUser(email);
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
      const passwords: PasswordComparisonPayload = {
        plainPassword: password,
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
      const token = this.jwtTokenService.createToken(user.id);
      const tokenDetails: JwtTokenPayload =
        this.jwtTokenService.verifyToken(token);

      return {
        status: 'success',
        data: {
          token,
          id: Number(tokenDetails.id),
          expireIn: tokenDetails.exp,
          privateKey: user.encrypted_private_key,
          publicKey: user.public_key,
          email: user.email,
        },
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '';
      throw new HttpException(
        {
          status: 'fail',
          message: 'User login failed' + errorMessage,
          code: 'USER_LOGIN_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':userId')
  @ApiOperation({ summary: `Get user with it's id` })
  @ApiParam({ name: 'userId', description: `User's to fetch id` })
  @ApiResponse({
    status: 200,
    description: 'Fetched user with success',
    type: UpdateUserDto,
  })
  getUser() {
    return 'Hello from get user by Id';
  }

  @Patch('update-me')
  @ApiOperation({ summary: 'Update user' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UpdateUserDto,
  })
  updateMe() {
    return 'Hello update me';
  }

  @Put(':userId/')
  @ApiOperation({ summary: 'Disable user' })
  @ApiParam({ name: 'userId', description: `User's to disable id` })
  @ApiResponse({
    status: 201,
    description: 'User disabled with success',
    schema: {
      example: { is_active: false },
    },
  })
  disable() {
    return 'Hello from disable';
  }
}
