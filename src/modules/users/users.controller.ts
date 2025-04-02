import { Controller, Get, Patch, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from './user-dto/create-user-dto';
import { CreateUserResponseDto } from './user-dto/create-user-response-dto';
import { LoginUserDto } from './user-dto/login-user-dto';
import { UpdateUserDto } from './user-dto/update-user-dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create a new you user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User created successfully',
    type: CreateUserResponseDto,
  })
  async signup() {
    const result = await this.usersService.countUsers();
    console.log(result);
    return 'hello from signup';
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
