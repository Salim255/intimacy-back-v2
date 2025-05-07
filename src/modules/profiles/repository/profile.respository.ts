import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateProfileDto } from '../profile-dto/profile-dto';
import { Profile } from '../entities/profile.entity';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class ProfileRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async insert(profile: CreateProfileDto): Promise<Profile> {
    const values = [
      profile.age,
      profile.displayName,
      profile.city,
      profile.country,
      profile.gender,
      profile.interestedIn,
    ];
    const query = `INSERT INTO profiles (age, display_name, city,country, gender, interested_in)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;`;
    const createdProfile: Profile = await this.dataSource.query(query, values);
    return createdProfile;
  }
}
