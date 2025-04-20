import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { UserDto } from './user-dto';

export class LoginUserDto {
  @ApiProperty({ description: 'The email of the user' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'The password of the user' })
  @IsNotEmpty()
  password: string;
}

export class GetUserResponseDto {
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
