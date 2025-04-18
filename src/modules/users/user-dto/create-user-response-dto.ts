import { ApiProperty } from '@nestjs/swagger';

export class CreateUserResponseDto {
  @ApiProperty({ description: 'Status of the response', example: 'success' })
  status: string;

  @ApiProperty({
    description: 'Data of the created user',
    type: Object, // This is the data being returned
    example: {
      token: 'your.jwt.token.here',
      id: 123,
      expireIn: 1609459200,
      privateKey: 'encryptedPrivateKeyHere',
      publicKey: 'publicKeyHere',
      email: 'user@example.com',
    },
  })
  data: {
    token: string;
    id: number;
    expireIn: number;
    privateKey: string;
    publicKey: string;
    email: string;
  };
}

export class LoginUserResponseDto extends CreateUserResponseDto {}
