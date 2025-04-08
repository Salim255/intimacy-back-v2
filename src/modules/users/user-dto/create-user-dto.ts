import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'The email of the user' })
  email: string;

  @ApiProperty({ description: 'The password of the user' })
  password: string;

  @ApiProperty({ description: 'The first name of the user' })
  first_name: string;

  @ApiProperty({ description: 'The last name of the user' })
  last_name: string;

  @ApiProperty({ description: 'The public key of the user' })
  public_key: string;

  @ApiProperty({ description: 'The private key of the user' })
  private_key: string;
}
