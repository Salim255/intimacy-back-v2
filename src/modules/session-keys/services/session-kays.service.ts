import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreatedSessionResponseDto,
  CreateSessionDto,
} from '../session-keys-dto/session-key-dto';
import { SessionKeysRepository } from '../repository/session-keys.repository';

@Injectable()
export class SessionKaysService {
  constructor(private readonly sessionKeysRepository: SessionKeysRepository) {}

  async createSessionKeys(
    createSessionPayload: CreateSessionDto,
  ): Promise<CreatedSessionResponseDto> {
    try {
      const createdSessionKeys: CreatedSessionResponseDto =
        await this.sessionKeysRepository.insert(createSessionPayload);
      return createdSessionKeys;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error to create session keys: ' + errorMessage,
          code: 'CREATE_SESSION_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
