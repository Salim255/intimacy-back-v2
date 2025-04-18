import { Injectable } from '@nestjs/common';
import { UserKeysRepository } from '../repository/user-keys.repository';
import { UserKeysType } from '../repository/user-keys.repository';

@Injectable()
export class UserKeysService {
  constructor(private readonly UserKeysRepository: UserKeysRepository) {}

  async createUserKeys(
    keysData: UserKeysType,
  ): Promise<Omit<UserKeysType, 'user_id'>> {
    return await this.UserKeysRepository.insert(keysData);
  }
}
