import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';

import {
  CreatedMessageDto,
  CreateMessageDto,
  CreateMessageResponseDto,
  PartnerConnectionStatus,
} from '../message-dto/message-dto';

const mocMessageController = {
  createMessage: jest.fn(),
};

describe('MessageController', () => {
  let controller: MessageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: MessageController,
          useValue: mocMessageController,
        },
      ],
    }).compile();

    controller = module.get<MessageController>(MessageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a message', async () => {
    // Arrange
    const createMessagePayload: CreateMessageDto = {
      content: 'Hello there, how are you doing?',
      from_user_id: 1,
      to_user_id: 2,
      chat_id: 1,
      partner_connection_status: PartnerConnectionStatus.OFFLINE,
    };
    const createdMessage: CreatedMessageDto = {
      id: 1,
      content: 'Hello there, how are you doing?',
      from_user_id: 1,
      to_user_id: 2,
      chat_id: 1,
      status: 'read',
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Act
    mocMessageController.createMessage.mockResolvedValue({
      data: {
        message: createdMessage,
      },
      status: 'success',
    });
    const result: CreateMessageResponseDto =
      await controller.createMessage(createMessagePayload);

    // Assert
    expect(result.data.message).toEqual(createdMessage);
    expect(mocMessageController.createMessage).toHaveBeenCalled();
    expect(mocMessageController.createMessage).toHaveBeenCalledTimes(1);
    expect(mocMessageController.createMessage).toHaveBeenCalledWith(
      createMessagePayload,
    );
  });
});
