import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { MatchDetails } from '../repository/match.repository';

export class InitiateMatchDto {
  @IsNumber()
  to_user_id: number;
}

export class MatchDto {
  @IsNumber()
  id: number;

  @IsNumber()
  from_user_id: number;

  @IsNumber()
  to_user_id: number;

  @IsNumber()
  status: number;
}

export class InitiateMatchResponseDto {
  @ApiProperty({
    description: 'Status initiate a match response',
    example: 'success',
  })
  status: 'Success';
  @ApiProperty({
    description: 'Initiated match details',
    type: Object,
  })
  data: {
    match: MatchDto;
  };
}

export class AcceptedMatchResponseDto {
  @ApiProperty({
    description: 'Status accepted match request response',
    example: 'success',
  })
  status: 'Success';
  @ApiProperty({
    description: 'Accepted match details',
    type: Object,
  })
  data: {
    match: MatchDto;
  };
}

export class FetchMatchesResponseDto {
  @ApiProperty({
    description: `Status fetched user's matches response`,
    example: 'success',
  })
  status: 'Success';
  @ApiProperty({
    description: 'Fetched matches details',
    type: Object,
  })
  data: {
    matches: MatchDetails[];
  };
}

export class PotentialMatch {
  @ApiProperty({ description: 'Profile id' })
  id: number;

  @ApiProperty({ description: 'Match id' })
  match_id: number | null;

  @ApiProperty({ description: 'Match status' })
  match_status: number | null;

  @ApiProperty({ description: 'User id' })
  user_id: number;

  @ApiProperty({ description: 'User birth date' })
  birth_date: Date;

  @ApiProperty({ description: 'User name' })
  name: string;

  @ApiProperty({ description: 'User photos' })
  photos: string[];

  @ApiProperty({ description: 'User country' })
  country: string;

  @ApiProperty({ description: 'User city' })
  city: string;

  @ApiProperty({ description: 'Profile user connection status' })
  connection_status: string;
}

export class FetchPotentialMatchesResponseDto {
  @ApiProperty({
    description: 'Fetched potential matches status',
    example: 'success',
  })
  status: string;
  @ApiProperty({
    description: 'Response data for fetched potential matches',
    example: {
      profiles: [
        {
          id: 1,
          match_id: null,
          user_id: 1,
          match_status: null,
          birth_date: 'date',
          name: 'Salim',
          photos: ['url1', 'url2'],
          country: 'France',
          city: 'Lille',
          connection_status: 'online',
        },
      ],
    },
  })
  data: {
    profiles: PotentialMatch[];
  };
}
