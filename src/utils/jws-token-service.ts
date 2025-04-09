import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export type JwtTokenPayload = {
  id: string;
  exp: number;
};

@Injectable()
export class JwtTokenService {
  constructor(private jwtService: JwtService) {
    console.log('✅ JwtTokenService constructed');
  }

  createToken(userId: number): string {
    console.log('JWT_SECRET:', process.env.JWT_SECRET, userId);
    return this.jwtService.sign({ id: userId });
  }

  verifyToken(token: string): JwtTokenPayload {
    return this.jwtService.verify(token);
  }

  decodedToken(token: string): JwtTokenPayload {
    return this.jwtService.decode(token);
  }
}
