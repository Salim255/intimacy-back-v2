import { Injectable } from '@nestjs/common';
import {
  ProfileRepository,
  UpdateCoordinatesPayload,
} from '../repository/profile.repository';
import {
  CreateProfileDto,
  ProfileDto,
  UpdateBioBodyDto,
  UpdateChildrenBodyDto,
  UpdateHomeBodyDto,
} from '../profile-dto/profile-dto';

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

  async updateProfileLocation(
    locationPayload: UpdateCoordinatesPayload,
  ): Promise<ProfileDto> {
    const result = this.profileRepository.updateLocation(locationPayload);
    return result;
  }

  async updateBio(updateBio: UpdateBioBodyDto): Promise<ProfileDto> {
    const result = this.profileRepository.updateBio(updateBio);
    return result;
  }

  async updateHome(homeData: UpdateHomeBodyDto): Promise<ProfileDto> {
    const result = this.profileRepository.updateHome(homeData);
    return result;
  }

  async updateChildren(
    updatePayload: UpdateChildrenBodyDto,
  ): Promise<ProfileDto> {
    const result = this.profileRepository.updateChildren(updatePayload);
    return result;
  }
}
