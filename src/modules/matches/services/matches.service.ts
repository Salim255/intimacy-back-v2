import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  AcceptMatchPayload,
  MatchDetails,
  MatchRepository,
} from '../repository/match.repository';
import { InitiateMatchInput } from '../repository/match.repository';
import { UserRepository } from '../../users/repository/user.repository';
import { PotentialMatch } from '../matches-dto/matches-dto';

@Injectable()
export class MatchesService {
  private logger = new Logger('MatchesService');
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async initiateMatch(input: InitiateMatchInput): Promise<MatchDetails> {
    try {
      // Check if the user there are initiated match
      const existMatch = await this.matchRepository.fetchMatchByUsers(
        input.fromUserId,
        input.toUserId,
      );

      if (existMatch) {
        const match: MatchDetails = await this.matchRepository.acceptMatch({
          matchId: existMatch.id,
          userId: existMatch.to_user_id,
        });

        return match;
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

      const match: MatchDetails =
        await this.matchRepository.initiateMatch(input);

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

  async acceptMatch(
    acceptMatchPayload: AcceptMatchPayload,
  ): Promise<MatchDetails> {
    try {
      const match: MatchDetails =
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

  async getMatches(userId: number): Promise<MatchDetails[]> {
    try {
      this.logger.log(userId);
      const matches: MatchDetails[] =
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

  async getMatchCandidates(userId: number): Promise<PotentialMatch[]> {
    try {
      const result: PotentialMatch[] =
        await this.matchRepository.findAvailableForMatch(userId);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error in fetch potential matches ' + errorMessage,
          code: 'FETCH_POTENTIAL_MATCHES_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
