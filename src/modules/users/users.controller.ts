import { Controller, Get, Patch, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './user-dto/create-user-dto';
import { CreateUserResponseDto } from './user-dto/create-user-response-dto';

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
  login() {
    return 'hello login';
  }

  @Get()
  async getHello() {
    const result = await this.usersService.countUsers();
    console.log(result);
    return `Hello world!, comment ca va, are you okay , where fuck you ?: ${result}`;
  }

  @Patch('update-me')
  updateMe() {
    return 'Hello update me';
  }

  @Put(':userId/disable')
  disable() {
    return 'Hello from disable';
  }
}
