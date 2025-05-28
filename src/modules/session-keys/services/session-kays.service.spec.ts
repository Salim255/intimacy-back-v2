import { Test, TestingModule } from '@nestjs/testing';
import { SessionKaysService } from './session-kays.service';

describe('SessionKaysService', () => {
  let service: SessionKaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionKaysService],
    }).compile();

    service = module.get<SessionKaysService>(SessionKaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
