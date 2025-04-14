import { Test, TestingModule } from '@nestjs/testing';
import { UserChatController } from './user-chat.controller';

describe('UserChatController', () => {
  let controller: UserChatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserChatController],
    }).compile();

    controller = module.get<UserChatController>(UserChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
