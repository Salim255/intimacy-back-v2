import { Test, TestingModule } from '@nestjs/testing';
import { MatchesController } from './matches.controller';
import { MatchesService } from '../services/matches.service';
import { JwtTokenService } from '../../auth/jws-token-service';

const mockMatchService = {
  initiateMatch: jest.fn(),
  acceptMatch: jest.fn(),
  fetchMatches: jest.fn(),
};

const mockJwtTokenService = {
  createToken: jest.fn(),
  verifyToken: jest.fn(),
};

describe('MatchesController', () => {
  let controller: MatchesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchesController],
      providers: [
        {
          provide: MatchesService,
          useValue: mockMatchService,
        },
        {
          provide: JwtTokenService,
          useValue: mockJwtTokenService,
        },
      ],
    }).compile();

    controller = module.get<MatchesController>(MatchesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
