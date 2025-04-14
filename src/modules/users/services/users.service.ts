import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserRepository, UserWithKeys } from '../repository/user.repository';
import { UserDto } from '../user-dto/update-user-dto';

export type InsertUserType = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(data: InsertUserType): Promise<User> {
    try {
      const createdUser = await this.userRepository.insert(data);
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
  async getUserById(userId: number): Promise<UserDto> {
    try {
      const user = await this.userRepository.getUserById(userId);
      return user;
    } catch (error) {
      throw new Error(`Error get user: ${error}`);
    }
  }

  async countUsers(): Promise<number> {
    try {
      const count = await this.userRepository.count();
      return count;
    } catch (error) {
      throw new Error(`Error in count users: ${error}`);
    }
  }
  async disableUser(userId: number) {
    try {
      const disabledUser = await this.userRepository.disableUser(userId);
      return disabledUser;
    } catch (error) {
      throw new Error(`Error in disable user: ${error}`);
    }
  }

  async updateUser(
    query: string,
    values: (string | number | boolean | null)[],
  ): Promise<UserDto> {
    try {
      const updatedUser = await this.userRepository.updateUser(query, values);
      return updatedUser;
    } catch (error) {
      throw new Error(`Error in update user: ${error}`);
    }
  }
  async updateUserConnectionStatus(
    userId: number,
    connectionStatus: string,
  ): Promise<User> {
    try {
      const updatedUser = await this.userRepository.updateUserConnectionStatus(
        userId,
        connectionStatus,
      );
      return updatedUser;
    } catch (error) {
      throw new Error(`Error in update user connection status: ${error}`);
    }
  }
}
