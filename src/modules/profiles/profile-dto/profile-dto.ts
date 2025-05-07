import { IsDate, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Gender, InterestedIn } from '../entities/profile.entity';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  displayName: string;
  @IsDate()
  age: Date;
  @IsEnum(Gender)
  gender: Gender;
  @IsString()
  country: string;
  @IsString()
  city: string;
  @IsEnum(InterestedIn)
  interestedIn: InterestedIn;
}
