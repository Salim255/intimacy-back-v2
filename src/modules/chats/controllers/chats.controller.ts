import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateChatDto,
  CreateChatResponseDto,
  FetchChatsResponseDto,
  UpdateChatCounterDto,
  UpdateChatCounterResponseDto,
} from '../chat-dto/chat-response.dto';
import { ChatsService } from '../services/chats.service';
import { Chat } from '../entities/chat.entity';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Chats')
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
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
    //1 Create chat Logic to create a new chat
    const result = await this.chatsService.createFullChat({
      ...createChatDto,
    });
    //2 Return the created chat
    return {
      status: 'Success',
      data: {
        chat: result,
      },
    };
  }

  @Patch()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update chat message counter',
    description:
      'This endpoint updates the message counter for a specific chat.',
  })
  @ApiBody({
    description: 'Chat ID and update type',
    type: UpdateChatCounterDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Chat message counter updated successfully.',
    type: UpdateChatCounterResponseDto,
  })
  async updateChatCounter(
    @Body() updateChatCounterDto: UpdateChatCounterDto,
  ): Promise<UpdateChatCounterResponseDto> {
    const { chat_id, update_type } = updateChatCounterDto;
    const result: Chat = await this.chatsService.updateChatCounter({
      chatId: chat_id,
      updateType: update_type,
    });
    return {
      status: 'Success',
      data: {
        chat: {
          id: result.id,
          no_read_messages: result.no_read_messages,
          updated_at: result.updated_at,
          created_at: result.created_at,
          type: result.type,
        },
      },
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get all chats by user ID',
    description:
      'This endpoint retrieves all chats associated with a specific user ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Chats retrieved successfully.',
    type: FetchChatsResponseDto,
  })
  async getAllChatsByUserId(
    @Req() req: Request,
  ): Promise<FetchChatsResponseDto> {
    const user = req.user as { id: number }; // Replace with actual user ID
    const chats = await this.chatsService.getAllChatsByUserId(user.id);
    return {
      status: 'Success',
      data: {
        chats,
      },
    };
  }
}
