import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserRepository, UserWithKeys } from './user.repository';

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
      throw new Error(`Error creating user: ${error}`);
    }
  }

  async getUser(email: string): Promise<UserWithKeys> {
    try {
      const user = await this.userRepository.getUser(email);
      return user;
    } catch (error) {
      throw new Error(`Error get user: ${error}`);
    }
  }
  async getUserById(userId: number): Promise<User> {
    try {
      const user = await this.userRepository.getUserById(userId);
      return user;
    } catch (error) {
      throw new Error(`Error get user: ${error}`);
    }
  }
}
