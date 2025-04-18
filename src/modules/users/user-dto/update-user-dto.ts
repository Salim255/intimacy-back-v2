import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

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

export class UserDto {
  @ApiProperty({ description: 'Updated user id' })
  id: number;

  @ApiProperty({ description: 'Updated user first name' })
  first_name: string;

  @ApiProperty({ description: 'Updated user last name' })
  last_name: string;

  @ApiProperty({ description: 'Updated user avatar' })
  avatar: string;

  @ApiProperty({ description: 'Updated user connection status' })
  connection_status: string;
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
