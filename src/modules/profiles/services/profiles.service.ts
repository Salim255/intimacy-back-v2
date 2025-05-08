import { Injectable } from '@nestjs/common';
import { ProfileRepository } from '../repository/profile.repository';
import { CreateProfileDto, ProfileDto } from '../profile-dto/profile-dto';

@Injectable()
export class ProfilesService {
  constructor(private profileRepository: ProfileRepository) {}

  async createProfile(data: CreateProfileDto): Promise<ProfileDto> {
    const createdProfile: ProfileDto =
      await this.profileRepository.insert(data);
    return createdProfile;
  }
}
