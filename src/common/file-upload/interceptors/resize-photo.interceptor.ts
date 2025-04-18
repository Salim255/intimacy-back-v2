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
      .getRequest<{ file?: Express.Multer.File }>();

    if (request.file) {
      const uniqueSuffix = crypto.randomBytes(8).toString('hex');
      const filename = `user-${uniqueSuffix}-${Date.now()}.jpeg`;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const buffer = await sharp(request.file.buffer)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .resize(500, 500)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .toFormat('jpeg')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .jpeg({ quality: 90 })
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .toBuffer();

      request.file.buffer = buffer as Buffer;
      request.file.filename = filename;
      console.log(request.file.filename, 'Hello');
    }

    return next.handle();
  }
}
