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

  async insert(profile: CreateProfileDto): Promise<ProfileDto> {
    const values = [
      profile.birthDate,
      profile.name,
      profile.city,
      profile.country,
      profile.gender,
      profile.interestedIn,
      1,
    ];
    const query = `INSERT INTO profiles (birth_date, name, city, country, gender, interested_in, user_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING avatar, birth_date, name, country, city, gender, interested_in;`;
    const createdProfile: ProfileDto = await this.dataSource.query(
      query,
      values,
    );
    return createdProfile;
  }
}
