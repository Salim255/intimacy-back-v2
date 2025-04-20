import { ApiProperty } from '@nestjs/swagger';

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
