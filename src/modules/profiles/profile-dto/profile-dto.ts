import { IsDate, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Gender, InterestedIn } from '../entities/profile.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  birthDate: Date;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsEnum(InterestedIn)
  @IsNotEmpty()
  interestedIn: InterestedIn;
}

export class ProfileDto {
  @ApiProperty({ description: 'User birth date' })
  birth_date: Date;

  @ApiProperty({ description: 'User name' })
  name: string;

  @ApiProperty({ description: 'User avatar' })
  avatar: string;

  @ApiProperty({ description: 'User gender' })
  gender: Gender;

  @ApiProperty({ description: 'User country' })
  country: string;

  @ApiProperty({ description: 'User city' })
  city: string;

  @ApiProperty({ description: 'User interested in' })
  interested_in: InterestedIn;
}

export class CreatedProfileResponseDto {
  @ApiProperty({ description: 'Create profile status', example: 'Success' })
  status: string;
  @ApiProperty({
    description: 'Created profile',
    example: { profile: ProfileDto },
  })
  data: { profile: ProfileDto };
}
