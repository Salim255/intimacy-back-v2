import { IsArray, IsDate, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import {
  Gender,
  InterestedIn,
  LookingFor,
  SexOrientation,
} from '../entities/profile.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export const profileExample = {
  id: 9,
  user_id: 1,
  name: 'BigOne',
  longitude: 1.33,
  latitude: 23.4,
  birth_date: new Date(),
  gender: Gender.Male,
  country: 'france',
  city: 'lille',
  bio: 'all is good',
  height: '4.4',
  children: false,
  education: 'uni',
  interested_in: InterestedIn.Both,
  looking_for: [LookingFor.Casual],
  photos: ['1', '2', '3', '4'],
  created_at: new Date(),
  updated_at: new Date(),
};

export class CreateProfileDto {
  @ApiProperty({ description: 'Profile name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'User birthdate' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  birthDate: Date;

  @ApiProperty({ description: 'User gender' })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty({ description: 'User country' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ description: 'User city' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Profile longitude' })
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({ description: 'Profile latitude' })
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({ description: 'User interest in' })
  @IsEnum(InterestedIn)
  @IsNotEmpty()
  interestedIn: InterestedIn;

  @ApiProperty({ description: 'Profile photos' })
  @IsArray()
  @IsNotEmpty()
  photos: string[];
}

export class ProfileDto {
  @ApiProperty({ description: 'Profile id' })
  id: number;

  @ApiProperty({ description: 'User id' })
  user_id: number;

  @ApiProperty({ description: 'User birth date' })
  birth_date: Date;

  @ApiProperty({ description: 'User name' })
  name: string;

  @ApiProperty({ description: 'User biography' })
  bio: string;

  @ApiProperty({ description: 'User height' })
  height: string;

  @ApiProperty({ description: 'User has children' })
  children: boolean;

  @ApiProperty({ description: 'User education' })
  education: string;

  @ApiProperty({ description: 'User gender' })
  gender: Gender;

  @ApiProperty({ description: 'User country' })
  country: string;

  @ApiProperty({ description: 'User city' })
  city: string;

  @ApiProperty({ description: 'User location latitude' })
  latitude: number;

  @ApiProperty({ description: 'User location longitude' })
  longitude: number;

  @ApiProperty({ description: 'User interested in' })
  interested_in: InterestedIn;

  @ApiProperty({ description: 'User looking for' })
  looking_for: LookingFor[];

  @ApiProperty({ description: 'User sex orientation' })
  sexual_orientation: SexOrientation;

  @ApiProperty({ description: 'User photos' })
  photos: string[];

  @ApiProperty({ description: 'Profile created  at' })
  created_at: Date;

  @ApiProperty({ description: 'Profile updated at' })
  updated_at: Date;
}

export class CreatedProfileResponseDto {
  @ApiProperty({ description: 'Create profile status', example: 'Success' })
  status: string;
  @ApiProperty({
    description: 'Created profile',
    example: {
      profile: profileExample,
    },
  })
  data: { profile: ProfileDto };
}

export class GetProfileResponseDto {
  @ApiProperty({
    description: 'Status of fetch profile response',
    example: 'success',
  })
  status: string;
  @ApiProperty({
    description: 'Fetched profile details',
    type: Object,
    example: {
      data: {
        profile: profileExample,
      },
    },
  })
  data: {
    profile: ProfileDto;
  };
}

export class UpdateCoordinatesBodyDto {
  @ApiProperty({ description: 'Profile longitude' })
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({ description: 'Profile latitude' })
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({ description: 'Profile id' })
  @IsNotEmpty()
  profileId: number;
}

export class UpdateBioBodyDto {
  @ApiProperty({ description: 'Profile bio' })
  @IsNotEmpty()
  bio: string;

  @ApiProperty({ description: 'Profile id' })
  @IsNotEmpty()
  profileId: number;
}

export class UpdateHomeBodyDto {
  @ApiProperty({ description: 'Profile city' })
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Profile country' })
  @IsNotEmpty()
  country: string;

  @ApiProperty({ description: 'Profile id' })
  @IsNotEmpty()
  profileId: number;
}

export class UpdateChildrenBodyDto {
  @ApiProperty({ description: 'Profile  has children' })
  @IsNotEmpty()
  status: boolean;

  @ApiProperty({ description: 'Profile id' })
  @IsNotEmpty()
  profileId: number;
}

export class UpdateEducationBodyDto {
  @ApiProperty({ description: 'Profile education' })
  @IsNotEmpty()
  education: string;

  @ApiProperty({ description: 'Profile id' })
  @IsNotEmpty()
  profileId: number;
}

export class UpdateGenderBodyDto {
  @ApiProperty({ description: 'Profile  has children' })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty({ description: 'Profile id' })
  @IsNotEmpty()
  profileId: number;
}

export class UpdateHeightBodyDto {
  @ApiProperty({ description: 'Profile height' })
  @IsNotEmpty()
  height: number;

  @ApiProperty({ description: 'Profile id' })
  @IsNotEmpty()
  profileId: number;
}

export class UpdateInterestsBodyDto {
  @ApiProperty({ description: 'Profile interest' })
  @IsNotEmpty()
  interestedIn: InterestedIn;

  @ApiProperty({ description: 'Profile id' })
  @IsNotEmpty()
  profileId: number;
}

export class UpdateLookingForBodyDto {
  @ApiProperty({ description: 'Profile looking for ...' })
  @IsNotEmpty()
  lookingFor: LookingFor;

  @ApiProperty({ description: 'Profile id' })
  @IsNotEmpty()
  profileId: number;
}

export class UpdatePhotosBodyDto {
  @ApiProperty({ description: 'Profile photos ' })
  @IsNotEmpty()
  photos: string[];

  @ApiProperty({ description: 'Profile id' })
  @IsNotEmpty()
  profileId: number;
}

export class UpdateAgeRangeBodyDto {
  @ApiProperty({ description: 'Profile maxAge range ...' })
  @IsNotEmpty()
  maxAge: number;

  @ApiProperty({ description: 'Profile minAge range ...' })
  @IsNotEmpty()
  minAge: number;

  @ApiProperty({ description: 'Profile id' })
  @IsNotEmpty()
  profileId: number;
}

export class UpdateDistanceRangeBodyDto {
  @ApiProperty({ description: 'Profile distance range ...' })
  @IsNotEmpty()
  distanceRange: number;

  @ApiProperty({ description: 'Profile id' })
  @IsNotEmpty()
  profileId: number;
}

export class UpdateSexOrientationBodyDto {
  @ApiProperty({ description: 'Profile sex orientation' })
  @IsNotEmpty()
  sexOrientation: SexOrientation;

  @ApiProperty({ description: 'Profile id' })
  @IsNotEmpty()
  profileId: number;
}
