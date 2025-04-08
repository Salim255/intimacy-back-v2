import {
  Controller,
  Get,
  Next,
  Patch,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import * as validator from 'validator';
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
import { NextFunction, Response, Request } from 'express';
import { AppError } from '../../../utils/appError';
import * as passwordHandler from '../../../utils/password-handler';
import { UserKeysService } from '../../user-keys/services/user-keys.service';
import {
  JwtTokenService,
  JwtTokenPayload,
} from '../../../utils/jws-token-service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly userKeysService: UserKeysService,
    private readonly usersService: UsersService,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create a new you user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User created successfully',
    type: CreateUserResponseDto,
  })
  async signup(
    @Res() res: Response,
    @Req() req: Request,
    @Next() next: NextFunction,
  ) {
    const { email, password, first_name, last_name, private_key, public_key } =
      req.body as CreateUserDto;
    // Validate the input data
    if (
      !email ||
      !validator.isEmail(email) ||
      !password ||
      !first_name ||
      !last_name ||
      !private_key ||
      !public_key
    ) {
      // Check if all required fields are provided
      // return 'Please provide all required fields';
      return next(new AppError('Please provide all required fields', 400));
    }

    const hashedPassword = await passwordHandler.hashedPassword(password);

    const createdUser = await this.usersService.createUser({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      public_key,
      private_key,
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

    res.status(200).json({
      status: 'success',
      data: {
        token,
        id: tokenDetails.id,
        expireIn: tokenDetails.exp,
        privateKey: userKeys.encrypted_private_key,
        publicKey: userKeys.public_key,
        email: createdUser.email,
      },
    });
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 200,
    description: 'User logged successfully',
    type: CreateUserResponseDto,
  })
  login() {
    return 'hello login';
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
