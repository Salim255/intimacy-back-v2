import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreatedMessageDto,
  CreateMessageDto,
  CreateMessageResponseDto,
  ToUserIdDto,
  UpdatedMessagesToDeliveredResponseDto,
} from '../message-dto/message-dto';
import { MessageService } from '../services/message.service';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Message')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}
  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new message' })
  @ApiBody({ type: CreateMessageDto })
  @ApiResponse({
    status: 201,
    description: 'Message created successfully',
    type: CreateMessageResponseDto,
  })
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<CreateMessageResponseDto> {
    const createdMessage: CreatedMessageDto =
      await this.messageService.createMessage(createMessageDto);
    return {
      status: 'Success',
      data: {
        message: createdMessage,
      },
    };
  }

  @Patch('update-active-chat/messages/delivered')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update messages in active chat to delivered' })
  @ApiBody({
    type: ToUserIdDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Update messages successfully',
    type: UpdatedMessagesToDeliveredResponseDto,
  })
  async updateActiveChatMessageToDelivered(
    @Body() toUserId: { toUserId: number },
    @Req() req: Request,
  ): Promise<UpdatedMessagesToDeliveredResponseDto> {
    try {
      const { id: fromUserId } = req.user as { id: number }; // Replace with actual user ID
      const updatedMessages =
        await this.messageService.updateMessagesInActiveChatToDelivered(
          fromUserId,
          toUserId.toUserId,
        );
      return {
        status: 'Success',
        data: {
          messages: updatedMessages,
        },
      };
    } catch (error) {
      console.log(error);
      const messageError =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Failed to update messages: ' + messageError,
          code: 'UPDATE_MESSAGES_TO_DELIVERED_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
