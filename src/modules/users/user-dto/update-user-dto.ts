import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: 'User first name' })
  first_name: string;

  @ApiProperty({ description: 'User last name' })
  last_name: string;

  @ApiProperty({ description: 'User avatar' })
  avatar: string;

  @ApiProperty({ description: 'User connection status' })
  connection_status: string;
}
