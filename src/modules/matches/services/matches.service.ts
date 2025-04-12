import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MatchRepository } from '../repository/match.repository';
import { InitiateMatchInput } from '../repository/match.repository';
import { UserRepository } from 'src/modules/users/repository/user.repository';
@Injectable()
export class MatchesService {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async initiateMatch(input: InitiateMatchInput) {
    try {
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
      const match = await this.matchRepository.InitiateMatch(input);
      return match;
      //return match;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      throw new HttpException(
        {
          status: '',
          message: 'Error in initiate match' + errorMessage,
          code: '',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
