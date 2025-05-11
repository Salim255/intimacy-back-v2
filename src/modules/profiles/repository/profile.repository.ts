import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateProfileDto, ProfileDto } from '../profile-dto/profile-dto';
import { InjectDataSource } from '@nestjs/typeorm';

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
}
