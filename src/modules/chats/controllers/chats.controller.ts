import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateChatDto,
  CreateChatResponseDto,
  FetchChatsResponseDto,
  FitchSingleChatWithDetailsResponse,
  UpdateActiveChatMessagesToReadResponseDto,
  UpdateChatCounterDto,
  UpdateChatCounterResponseDto,
} from '../chat-dto/chat-response.dto';
import { ChatsService } from '../services/chats.service';
import { Chat } from '../entities/chat.entity';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Message } from 'src/modules/messages/entities/message.entity';

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
    console.log(createChatDto);
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

  @Get(':chatId')
  @ApiParam({ name: 'chatId', description: `ID of the chat to fetch` })
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Fetch chat by its id' })
  @ApiResponse({
    status: 200,
    description: 'Chat retrieved successfully.',
    type: FitchSingleChatWithDetailsResponse,
  })
  async fetchChatByChatIdUserId(
    @Param('chatId') chatId: number,
    @Req() req: Request,
  ) {
    try {
      const { id: userId } = req.user as { id: number }; // Replace with actual user I
      const chat = await this.chatsService.fetchChatByChatIdUserId(
        chatId,
        userId,
      );
      return {
        status: 'Success',
        data: {
          chat,
        },
      };
    } catch (error) {
      const messageError = error instanceof Error ? error.message : '';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Fails to fetch chat by id: ' + messageError,
          code: 'ERROR_FETCH_CHAT_BY_ID',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':chatId/update-ms-to-read')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Upadate messages in a given chat ID to read' })
  @ApiParam({
    name: 'chatId',
    description: 'ID of the chat we update its messages',
  })
  @ApiResponse({
    status: 200,
    description: 'Messages updated to read with success',
    type: UpdateActiveChatMessagesToReadResponseDto,
  })
  async updateChatMessagesToRead(
    @Param('chatId') chatId: number,
    @Req() req: Request,
  ): Promise<UpdateActiveChatMessagesToReadResponseDto> {
    try {
      console.log(chatId, 'Hello chatId😍😍😍');
      const { id: senderId } = req.user as { id: number };
      const messages: Message[] =
        await this.chatsService.updateChatMessagesToRead({ chatId, senderId });
      return {
        status: 'Success',
        data: {
          messages,
        },
      };
    } catch (error) {
      const messageError = error instanceof Error ? error.message : '';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Fails to update chat messages to read: ' + messageError,
          code: 'ERROR_UPDATING_CHAT_MESSAGES_TO READ',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
