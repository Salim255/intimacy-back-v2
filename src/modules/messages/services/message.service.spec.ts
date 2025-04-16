import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { MessageRepository } from '../repository/message.repository';

const mockMessageRepository = {
  // Mock methods of MessageRepository here
};

describe('MessageService', () => {
  let service: MessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: MessageRepository,
          useValue: mockMessageRepository,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
