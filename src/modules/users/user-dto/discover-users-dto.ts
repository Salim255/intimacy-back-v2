import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user-dto';

export class DiscoverDto extends UserDto {
  @ApiProperty({ description: 'Match status' })
  match_status: number | null;
  match_id: number | null;
}
export class DiscoverUsersResponseDto {
  @ApiProperty({
    description: 'Fetched potential match status',
    example: 'success',
  })
  status: string;
  @ApiProperty({
    description: 'Response data for fetched potential matches',
    example: {
      users: [
        {
          id: 1,
          first_name: 'John',
          last_name: 'Adams',
          avatar: 'adams.image',
          connection_status: 'online',
          match_status: null,
          match_id: null,
        },
      ],
    },
  })
  data: {
    users: DiscoverDto[];
  };
}
