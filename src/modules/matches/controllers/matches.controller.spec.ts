import { Test, TestingModule } from '@nestjs/testing';
import { MatchesController } from './matches.controller';
import { MatchesService } from '../services/matches.service';
import { JwtTokenService } from '../../auth/jws-token-service';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  InitiateMatchDto,
  InitiateMatchResponseDto,
} from '../matches-dto/matches-dto';
import { ConnectionStatus, MatchDetails } from '../repository/match.repository';

const matchProfile: MatchDetails = {
  partner_id: 1,
  profile_id: 2,
  name: 'Salim',
  birth_date: new Date(),
  city: 'lille',
  country: 'france',
  photos: ['phot1', 'photo2'],
  connection_status: ConnectionStatus.Online,
  match_updated_at: new Date(),
  public_key: 'jndksdksd',
  match_id: 3,
  match_status: 2,
  match_created_at: new Date(),
};

const mockMatchService = {
  initiateMatch: jest.fn(),
  acceptMatch: jest.fn(),
  getMatches: jest.fn(),
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
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<MatchesController>(MatchesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should initiate match', async () => {
    // Arrange
    const body: InitiateMatchDto = {
      to_user_id: 1,
    };

    const req = {
      user: { id: 2 },
    } as Partial<Request> as Request;

    const initiateMatchResult: MatchDetails = {
      ...matchProfile,
      match_status: 1,
    };
    //
    const initiateMatchResponse: InitiateMatchResponseDto = {
      status: 'Success',
      data: {
        match: { ...matchProfile, match_status: 1 },
      },
    };
    mockMatchService.initiateMatch.mockResolvedValue(initiateMatchResult);

    // Act
    const result = await controller.initiateMatch(req, body);
    // Assert
    expect(mockMatchService.initiateMatch).toHaveBeenCalledTimes(1);
    expect(mockMatchService.initiateMatch).toHaveBeenCalledWith({
      fromUserId: 2,
      toUserId: 1,
    });
    expect(result.data.match.match_status).toEqual(
      initiateMatchResponse.data.match.match_status,
    );
  });

  it('should accept match', async () => {
    // Arrange
    const req = {
      user: { id: 2 },
    } as Partial<Request> as Request;
    const params = { matchId: 1 };

    const acceptMatchResult = matchProfile;

    const acceptMatchResponse: InitiateMatchResponseDto = {
      status: 'Success',
      data: {
        match: acceptMatchResult,
      },
    };
    mockMatchService.acceptMatch.mockResolvedValue(acceptMatchResult);

    // Act
    const result = await controller.acceptMatch(params.matchId, req);

    // Assert
    expect(mockMatchService.acceptMatch).toHaveBeenCalledTimes(1);
    expect(mockMatchService.acceptMatch).toHaveBeenCalledWith({
      matchId: 1,
      userId: 2,
    });
    expect(result).toEqual(acceptMatchResponse);
  });

  it('should fetch matches', async () => {
    // Arrange
    const req = {
      user: { id: 2 },
    } as Partial<Request> as Request;
    const fetchMatchesResult = [
      {
        id: 1,
        to_user_id: 1,
        from_user_id: 2,
        status: 2,
      },
    ];
    const fetchedMatchesResponse = {
      status: 'Success',
      data: {
        matches: fetchMatchesResult,
      },
    };
    mockMatchService.getMatches.mockResolvedValue(fetchMatchesResult);

    // Act
    const result = await controller.fetchMatches(req);

    // Assert
    expect(mockMatchService.getMatches).toHaveBeenCalledTimes(1);
    expect(mockMatchService.getMatches).toHaveBeenCalledWith(2);
    expect(result).toEqual(fetchedMatchesResponse);
    expect(result.data.matches).toEqual(fetchMatchesResult);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
