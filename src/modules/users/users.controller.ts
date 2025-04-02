import { Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post()
  async signup() {
    const result = await this.usersService.countUsers();
    console.log(result);
    return 'hello from signup';
  }
  @Get()
  async getHello() {
    const result = await this.usersService.countUsers();
    console.log(result);
    return `Hello world!, comment ca va, are you okay , where fuck you ?: ${result}`;
  }
}
