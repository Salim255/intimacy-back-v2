import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtTokenService } from '../../utils/jws-token-service';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtTokenService: JwtTokenService) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = this.jwtTokenService.verifyToken(token);
      // 4 Set decode as user in request
      request.user = { id: decoded.id };
      return true;
    } catch {
      return false;
    }
  }
}
