import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreatedMessageDto,
  CreateMessageDto,
  CreateMessageResponseDto,
} from '../message-dto/message-dto';
import { MessageService } from '../services/message.service';

@ApiTags('Message')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new message' })
  @ApiBody({ type: CreateMessageDto })
  @ApiResponse({
    status: 201,
    description: 'Message created successfully',
    type: CreateMessageResponseDto,
  })
  async createMessage(@Body() createMessageDto: CreateMessageDto) {
    const createdMessage: CreatedMessageDto =
      await this.messageService.createMessage({
        content: createMessageDto.content,
        fromUserId: createMessageDto.from_user_id,
        toUserId: createMessageDto.to_user_id,
        chatId: createMessageDto.chat_id,
        status: createMessageDto.status,
      });
    return {
      status: 'Success',
      data: {
        message: createdMessage,
      },
    };
  }
}
