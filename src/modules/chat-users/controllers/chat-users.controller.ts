import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Chat Users')
@Controller('chat-users')
export class ChatUsersController {}
