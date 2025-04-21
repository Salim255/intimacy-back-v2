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
