// src/common/file-upload/interceptors/resize-image.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as sharp from 'sharp';
import * as crypto from 'crypto';

@Injectable()
export class ResizePhotoInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context
      .switchToHttp()
      .getRequest<{ file?: Express.Multer.File; user: { id: number } }>();

    if (request.file) {
      const { id: userId } = request.user as { id: number };
      const uniqueSuffix = crypto.randomBytes(8).toString('hex');
      const filename = `user-${userId}-${uniqueSuffix}-${Date.now()}.jpeg`;

      const buffer = await sharp(request.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toBuffer();

      request.file.buffer = buffer;
      request.file.filename = filename;
    }

    return next.handle();
  }
}
