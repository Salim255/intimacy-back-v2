import { Injectable } from '@nestjs/common';
import {
  ProfileRepository,
  UpdateCoordinatesPayload,
} from '../repository/profile.repository';
import {
  CreateProfileDto,
  ProfileDto,
  UpdateAgeRangeBodyDto,
  UpdateBioBodyDto,
  UpdateChildrenBodyDto,
  UpdateDistanceRangeBodyDto,
  UpdateEducationBodyDto,
  UpdateGenderBodyDto,
  UpdateHeightBodyDto,
  UpdateHomeBodyDto,
  UpdateInterestsBodyDto,
  UpdateLookingForBodyDto,
  UpdatePhotosBodyDto,
} from '../profile-dto/profile-dto';
import { LookingFor } from '../entities/profile.entity';

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
    if (typeof createdProfile.looking_for === 'string') {
      createdProfile.looking_for = this.convertToLookingFor(
        createdProfile.looking_for,
      );
    }
    return createdProfile;
  }

  async getProfileById(userId: number): Promise<ProfileDto> {
    const fetchedProfile: ProfileDto =
      await this.profileRepository.getProfile(userId);
    if (typeof fetchedProfile.looking_for === 'string') {
      fetchedProfile.looking_for = this.convertToLookingFor(
        fetchedProfile.looking_for,
      );
    }
    return fetchedProfile;
  }

  async updateProfileLocation(
    locationPayload: UpdateCoordinatesPayload,
  ): Promise<ProfileDto> {
    const result = await this.profileRepository.updateLocation(locationPayload);
    if (typeof result.looking_for === 'string') {
      result.looking_for = this.convertToLookingFor(result.looking_for);
    }
    return result;
  }

  async updateBio(updateBio: UpdateBioBodyDto): Promise<ProfileDto> {
    const result = await this.profileRepository.updateBio(updateBio);
    if (typeof result.looking_for === 'string') {
      result.looking_for = this.convertToLookingFor(result.looking_for);
    }
    return result;
  }

  async updateHome(homeData: UpdateHomeBodyDto): Promise<ProfileDto> {
    const result = await this.profileRepository.updateHome(homeData);
    if (typeof result.looking_for === 'string') {
      result.looking_for = this.convertToLookingFor(result.looking_for);
    }
    return result;
  }

  async updateAgeRange(agePayload: UpdateAgeRangeBodyDto): Promise<ProfileDto> {
    const result = await this.profileRepository.updateAgeRange(agePayload);
    if (typeof result.looking_for === 'string') {
      result.looking_for = this.convertToLookingFor(result.looking_for);
    }
    return result;
  }

  async updateChildren(
    updatePayload: UpdateChildrenBodyDto,
  ): Promise<ProfileDto> {
    const result = await this.profileRepository.updateChildren(updatePayload);
    if (typeof result.looking_for === 'string') {
      result.looking_for = this.convertToLookingFor(result.looking_for);
    }
    return result;
  }

  async updateEducation(
    updatePayload: UpdateEducationBodyDto,
  ): Promise<ProfileDto> {
    const result = await this.profileRepository.updateEducation(updatePayload);
    if (typeof result.looking_for === 'string') {
      result.looking_for = this.convertToLookingFor(result.looking_for);
    }
    return result;
  }

  async updateGender(updatePayload: UpdateGenderBodyDto): Promise<ProfileDto> {
    const result = await this.profileRepository.updateGender(updatePayload);
    if (typeof result.looking_for === 'string') {
      result.looking_for = this.convertToLookingFor(result.looking_for);
    }
    return result;
  }

  async updateHeight(updatePayload: UpdateHeightBodyDto): Promise<ProfileDto> {
    const result = await this.profileRepository.updateHeight(updatePayload);
    if (typeof result.looking_for === 'string') {
      result.looking_for = this.convertToLookingFor(result.looking_for);
    }
    return result;
  }

  async updateInterests(
    updatePayload: UpdateInterestsBodyDto,
  ): Promise<ProfileDto> {
    const result = await this.profileRepository.updateInterests(updatePayload);
    if (typeof result.looking_for === 'string') {
      result.looking_for = this.convertToLookingFor(result.looking_for);
    }
    return result;
  }

  async updateLookingFor(
    updatePayload: UpdateLookingForBodyDto,
  ): Promise<ProfileDto> {
    const result = await this.profileRepository.updateLookingFor(updatePayload);
    if (typeof result.looking_for === 'string') {
      result.looking_for = this.convertToLookingFor(result.looking_for);
    }
    return result;
  }

  async updatePhotos(updatePayload: UpdatePhotosBodyDto): Promise<ProfileDto> {
    const result = await this.profileRepository.updatePhots(updatePayload);
    if (typeof result.looking_for === 'string') {
      result.looking_for = this.convertToLookingFor(result.looking_for);
    }
    return result;
  }

  async updateDistanceRange(
    distancePayload: UpdateDistanceRangeBodyDto,
  ): Promise<ProfileDto> {
    const result =
      await this.profileRepository.updateDistanceRange(distancePayload);
    if (typeof result.looking_for === 'string') {
      result.looking_for = this.convertToLookingFor(result.looking_for);
    }
    return result;
  }

  convertToLookingFor(lookingFor: string): LookingFor[] {
    let lookingForList: string[] = [];
    const lookingForStr = lookingFor;
    lookingForList = lookingForStr
      .replace(/[{}]/g, '') // Remove { and }
      .split(',')
      .map((item: string) => item.trim());
    return lookingForList as LookingFor[];
  }
}
