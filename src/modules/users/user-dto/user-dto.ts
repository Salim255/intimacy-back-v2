import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: 'Updated user id' })
  id: number;
  @ApiProperty({ description: 'Updated user connection status' })
  connection_status: string;
}
