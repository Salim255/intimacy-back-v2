import { Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post()
  signup() {
    return 'hello from signup';
  }
  @Get()
  getHello(): string {
    return 'Hello world!, comment ca va, are you okay , where fuck you ?';
  }
}
