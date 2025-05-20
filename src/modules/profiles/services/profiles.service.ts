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
  UpdateEducationBodyDto,
  UpdateGenderBodyDto,
  UpdateHeightBodyDto,
  UpdateHomeBodyDto,
  UpdateInterestsBodyDto,
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

  async updateEducation(
    updatePayload: UpdateEducationBodyDto,
  ): Promise<ProfileDto> {
    const result = this.profileRepository.updateEducation(updatePayload);
    return result;
  }

  async updateGender(updatePayload: UpdateGenderBodyDto): Promise<ProfileDto> {
    const result = this.profileRepository.updateGender(updatePayload);
    return result;
  }

  async updateHeight(updatePayload: UpdateHeightBodyDto): Promise<ProfileDto> {
    const result = this.profileRepository.updateHeight(updatePayload);
    return result;
  }

  async updateInterests(
    updatePayload: UpdateInterestsBodyDto,
  ): Promise<ProfileDto> {
    const result = this.profileRepository.updateInterests(updatePayload);
    return result;
  }
}
