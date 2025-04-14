import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from './matches.service';
import {
  AcceptMatchPayload,
  InitiateMatchInput,
} from '../repository/match.repository';
import { Match } from '../entities/match.entity';

const mockMatchService = {
  initiateMatch: jest.fn(),
  acceptMatch: jest.fn(),
  getMatches: jest.fn(),
};

describe('MatchesService', () => {
  let service: MatchesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: MatchesService,
          useValue: mockMatchService,
        },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
  });

  it('should be defined', () => {
    //console.log(service);
    expect(service).toBeDefined();
  });

  it('should sent match request', async () => {
    // Arrange
    const initiateMatchPayload: InitiateMatchInput = {
      fromUserId: 2,
      toUserId: 1,
    };
    const initiateMatchResult: Match = {
      id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      to_user_id: 1,
      from_user_id: 2,
      status: 1,
    };
    mockMatchService.initiateMatch.mockResolvedValue(initiateMatchResult);

    // Act
    const result = await service.initiateMatch(initiateMatchPayload);

    // Assert
    expect(mockMatchService.initiateMatch).toHaveBeenCalledWith(
      initiateMatchPayload,
    );
    expect(mockMatchService.initiateMatch).toHaveBeenCalledTimes(1);
    expect(result).toEqual(initiateMatchResult);
  });

  it('should accept a match request', async () => {
    // Arrange
    const acceptMatchPayload: AcceptMatchPayload = {
      matchId: 1,
      userId: 1,
    };
    const initiateMatchResult: Match = {
      id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      to_user_id: 1,
      from_user_id: 2,
      status: 2,
    };
    mockMatchService.acceptMatch.mockResolvedValue(initiateMatchResult);
    // Act
    const result = await service.acceptMatch(acceptMatchPayload);
    // Assert
    expect(mockMatchService.acceptMatch).toHaveBeenCalledWith(
      acceptMatchPayload,
    );
    expect(mockMatchService.acceptMatch).toHaveBeenCalledTimes(1);
    expect(result).toEqual(initiateMatchResult);
  });

  it('should fetch all matches by user', async () => {
    // Arrange
    const getMatchesResult: Match[] = [
      {
        id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        to_user_id: 1,
        from_user_id: 2,
        status: 2,
      },
      {
        id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        to_user_id: 1,
        from_user_id: 2,
        status: 2,
      },
    ];

    mockMatchService.getMatches.mockResolvedValue(getMatchesResult);
    // Act
    const result = await service.getMatches(1);
    // Assert
    expect(mockMatchService.getMatches).toHaveBeenCalledWith(1);
    expect(mockMatchService.getMatches).toHaveBeenCalledTimes(1);
    expect(result).toEqual(getMatchesResult);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
