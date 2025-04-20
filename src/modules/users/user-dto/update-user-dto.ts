import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { UserDto } from './user-dto';

export class UpdateUserDto {
  @ApiProperty({ description: 'User first name' })
  @IsOptional()
  first_name?: string;

  @ApiProperty({ description: 'User last name' })
  @IsOptional()
  last_name?: string;

  @ApiProperty({ description: 'User avatar' })
  @IsOptional()
  avatar?: string;

  @ApiProperty({ description: 'User connection status' })
  @IsOptional()
  connection_status?: string;
}

export class UpdatedUserResponseDto {
  @ApiProperty({
    description: 'Status of update response',
    example: 'success',
  })
  status: string;

  @ApiProperty({
    description: 'Updated user details',
    type: Object,
    example: {
      data: {
        user: {
          id: 1,
          first_name: 'Salim',
          last_name: 'Hassan',
          avatar: 'avatar',
          connection_status: 'online',
        },
      },
    },
  })
  data: {
    user: UserDto;
  };
}
