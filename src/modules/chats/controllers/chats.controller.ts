import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateChatDto,
  CreateChatResponseDto,
} from '../chat-dto/chat-response.dto';
import { ChatsService } from '../services/chats.service';

@ApiTags('Chats')
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create a new chat',
    description:
      'This endpoint creates a new chat and returns the chat details.',
  })
  @ApiBody({
    description: 'Chat creation payload',
    type: CreateChatDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Chat created successfully.',
    type: CreateChatResponseDto,
  })
  async createChat(
    @Body() createChatDto: CreateChatDto,
  ): Promise<CreateChatResponseDto> {
    console.log('Create chat DTO:', createChatDto);
    //1 Create chat Logic to create a new chat
    const result = await this.chatsService.createFullChat({
      ...createChatDto,
    });
    //2 Return the created chat
    return {
      status: 'success',
      data: {
        chat: result,
      },
    };
  }
}
