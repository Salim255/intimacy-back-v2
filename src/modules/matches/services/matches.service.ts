import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  AcceptMatchPayload,
  MatchRepository,
  PartnerMatchDetails,
} from '../repository/match.repository';
import { InitiateMatchInput } from '../repository/match.repository';
import { UserRepository } from '../../users/repository/user.repository';
import { Match } from '../entities/match.entity';
import { MatchDto } from '../matches-dto/matches-dto';

@Injectable()
export class MatchesService {
  private logger = new Logger('MatchesService');
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async initiateMatch(input: InitiateMatchInput): Promise<MatchDto> {
    try {
      if (input.fromUserId === input.toUserId) {
        throw new HttpException(
          {
            status: 'fail',
            message: 'Cannot initiate match: users conflict.',
            code: 'USERS_CONFLICT',
          },
          HttpStatus.CONFLICT,
        );
      }
      // Check the potential match user is exist
      const existUser = await this.userRepository.getUserById(input.toUserId);
      if (!existUser) {
        throw new HttpException(
          {
            status: 'fail',
            message: 'Cannot initiate match: user does not exist.',
            code: 'USER_NOT_FOUND',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const match: MatchDto = await this.matchRepository.initiateMatch(input);
      if (!match) {
        throw new HttpException(
          {
            status: 'fail',
            message: 'Cannot initiate match: match not created.',
            code: 'MATCH_NOT_CREATED',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      // Check if the match is already exist
      return match;
      //return matchData;
    } catch (error) {
      console.log(error);
      const errorMessage = error instanceof Error ? error.message : '';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error in initiate match: ' + errorMessage,
          code: 'INITIATE_MATCH_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async acceptMatch(acceptMatchPayload: AcceptMatchPayload): Promise<Match> {
    try {
      const match: Match =
        await this.matchRepository.acceptMatch(acceptMatchPayload);
      return match;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error in accept match: ' + errorMessage,
          code: 'ACCEPT_MATCH_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMatches(userId: number): Promise<PartnerMatchDetails[]> {
    try {
      this.logger.log(userId);
      const matches: PartnerMatchDetails[] =
        await this.matchRepository.fetchMatches(userId);
      return matches;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      throw new HttpException(
        {
          status: 'fail',
          message: `Error in fetch user's matches: ` + errorMessage,
          code: 'GET_MATCHES_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
