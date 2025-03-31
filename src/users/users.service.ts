import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';

export type insertUserType = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isStaff: boolean;
};

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(data: insertUserType): Promise<User> {
    try {
      const hashedPassword: string = await bcrypt.hash(data.password, 10);
      const createdUser = await this.userRepository.insert({
        ...data,
        password: hashedPassword,
      });
      return createdUser;
    } catch (error) {
      throw new Error('Error creating user', error);
    }
  }
}
