import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'The email of the user' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The password of the user' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'The first name of the user' })
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ description: 'The last name of the user' })
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ description: 'The public key of the user' })
  @IsNotEmpty()
  public_key: string;

  @ApiProperty({ description: 'The private key of the user' })
  @IsNotEmpty()
  private_key: string;
}
