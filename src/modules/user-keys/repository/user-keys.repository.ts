import { Injectable } from '@nestjs/common';
import { UserKeys } from '../entities/user-keys.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

export type UserKeysType = {
  user_id: number;
  public_key: string;
  encrypted_private_key: string;
};
@Injectable()
export class UserKeysRepository {
  constructor(
    @InjectRepository(UserKeys)
    private readonly userKeysRepository: Repository<UserKeys>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async insert(data: UserKeysType): Promise<Omit<UserKeysType, 'user_id'>> {
    const query = `
    INSERT INTO user_keys (user_id, public_key, encrypted_private_key)
    VALUES ($1, $2, $3)
    RETURNING public_key, encrypted_private_key;
    `;
    const values = [data.user_id, data.public_key, data.encrypted_private_key];
    const result: UserKeys[] = await this.dataSource.query(query, values);
    return result[0];
  }
}
