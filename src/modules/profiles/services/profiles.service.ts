import { Injectable } from '@nestjs/common';
import { ProfileRepository } from '../repository/profile.repository';
import { CreateProfileDto, ProfileDto } from '../profile-dto/profile-dto';

@Injectable()
export class ProfilesService {
  constructor(private profileRepository: ProfileRepository) {}

  async createProfile(
    data: CreateProfileDto,
    userId: number,
  ): Promise<ProfileDto> {
    const createdProfile: ProfileDto = await this.profileRepository.insert(
      data,
      userId,
    );
    return createdProfile;
  }

  async getProfileById(userId: number): Promise<ProfileDto> {
    const fetchedProfile: ProfileDto =
      await this.profileRepository.getProfile(userId);
    return fetchedProfile;
  }
}
