import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  AcceptMatchPayload,
  MatchRepository,
} from '../repository/match.repository';
import { InitiateMatchInput } from '../repository/match.repository';
import { UserRepository } from 'src/modules/users/repository/user.repository';
import { Match } from '../entities/match.entity';

@Injectable()
export class MatchesService {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async initiateMatch(input: InitiateMatchInput): Promise<Match> {
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
      console.log(existUser, input.toUserId);
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
      const match: Match = await this.matchRepository.InitiateMatch(input);
      return match;
      //return match;
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

  async getMatches(userId: number): Promise<Match[]> {
    try {
      const matches: Match[] = await this.matchRepository.fetchMatches(userId);
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
