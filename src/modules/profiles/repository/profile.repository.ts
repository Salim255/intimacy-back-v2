import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
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
import { InjectDataSource } from '@nestjs/typeorm';

export type UpdateCoordinatesPayload = {
  longitude: number;
  latitude: number;
  profileId: number;
};

@Injectable()
export class ProfileRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async insert(profile: CreateProfileDto, userId: number): Promise<ProfileDto> {
    const values = [
      profile.birthDate,
      profile.name,
      profile.city,
      profile.country,
      profile.gender,
      profile.interestedIn,
      userId,
      profile.photos,
    ];
    const query = `INSERT INTO profiles 
    (birth_date, name, city, country, gender, interested_in, user_id, photos)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`;
    const createdProfile: ProfileDto[] = await this.dataSource.query(
      query,
      values,
    );
    return createdProfile[0];
  }

  async getProfile(userId: number): Promise<ProfileDto> {
    const values = [userId];
    const query = `SELECT * FROM profiles WHERE user_id = $1`;
    const fetchedProfile: ProfileDto[] = await this.dataSource.query(
      query,
      values,
    );
    return fetchedProfile[0];
  }

  async updateLocation(
    coordinates: UpdateCoordinatesPayload,
  ): Promise<ProfileDto> {
    const values = [
      coordinates.latitude,
      coordinates.longitude,
      coordinates.profileId,
    ];
    console.log(coordinates);
    const query = `UPDATE profiles
    SET latitude = $1,longitude = $2
    WHERE profiles.id = $3
    RETURNING *;`;

    const updatedProfile: ProfileDto[] = await this.dataSource.query(
      query,
      values,
    );
    return updatedProfile[0];
  }

  async updateBio(updatePayload: UpdateBioBodyDto): Promise<ProfileDto> {
    const values = [updatePayload.bio, updatePayload.profileId];

    const query = `UPDATE profiles
    SET bio = $1
    WHERE profiles.id = $2
    RETURNING *;`;

    const updatedProfile: ProfileDto[] = await this.dataSource.query(
      query,
      values,
    );
    return updatedProfile[0];
  }

  async updateHome(updatePayload: UpdateHomeBodyDto): Promise<ProfileDto> {
    const values = [
      updatePayload.city,
      updatePayload.country,
      updatePayload.profileId,
    ];

    const query = `UPDATE profiles
    SET city = $1, country = $2
    WHERE profiles.id = $3
    RETURNING *;`;
    const updatedProfile: ProfileDto[] = await this.dataSource.query(
      query,
      values,
    );
    return updatedProfile[0];
  }

  async updateChildren(
    updatePayload: UpdateChildrenBodyDto,
  ): Promise<ProfileDto> {
    const values = [updatePayload.status, updatePayload.profileId];

    const query = `UPDATE profiles
    SET children = $1
    WHERE profiles.id = $2
    RETURNING *;`;
    const updatedProfile: ProfileDto[] = await this.dataSource.query(
      query,
      values,
    );
    return updatedProfile[0];
  }

  async updateEducation(
    updatePayload: UpdateEducationBodyDto,
  ): Promise<ProfileDto> {
    const values = [updatePayload.education, updatePayload.profileId];

    const query = `UPDATE profiles
    SET education = $1
    WHERE profiles.id = $2
    RETURNING *;`;
    const updatedProfile: ProfileDto[] = await this.dataSource.query(
      query,
      values,
    );
    return updatedProfile[0];
  }

  async updateGender(updatePayload: UpdateGenderBodyDto): Promise<ProfileDto> {
    const values = [updatePayload.gender, updatePayload.profileId];

    const query = `UPDATE profiles
    SET gender = $1
    WHERE profiles.id = $2
    RETURNING *;`;
    const updatedProfile: ProfileDto[] = await this.dataSource.query(
      query,
      values,
    );
    return updatedProfile[0];
  }

  async updateHeight(updatePayload: UpdateHeightBodyDto): Promise<ProfileDto> {
    const values = [updatePayload.height, updatePayload.profileId];

    const query = `UPDATE profiles
    SET height = $1
    WHERE profiles.id = $2
    RETURNING *;`;
    const updatedProfile: ProfileDto[] = await this.dataSource.query(
      query,
      values,
    );
    return updatedProfile[0];
  }

  async updateInterests(
    updatePayload: UpdateInterestsBodyDto,
  ): Promise<ProfileDto> {
    const values = [updatePayload.interestedIn, updatePayload.profileId];
    const query = `UPDATE profiles
    SET interested_in = $1
    WHERE profiles.id = $2
    RETURNING *;`;
    const updatedProfile: ProfileDto[] = await this.dataSource.query(
      query,
      values,
    );
    return updatedProfile[0];
  }
}
