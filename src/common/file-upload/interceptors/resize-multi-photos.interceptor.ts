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
export class ResizeMultiPhotosInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context
      .switchToHttp()
      .getRequest<{ files?: Express.Multer.File }>();

    const files = (request.files || []) as Express.Multer.File[];
    if (files.length) {
      // Run all sharp-resize operations in parallel
      await Promise.all(
        files.map(async (file) => {
          console.log(file, 'hello file')
          const buffer = await sharp(file.buffer)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            .resize(500, 500)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            .toFormat('jpeg')
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            .jpeg({ quality: 90 })
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            .toBuffer();

          const uniqueSuffix = crypto.randomBytes(8).toString('hex');
          const filename = `user-${uniqueSuffix}-${Date.now()}.jpeg`;
          file.buffer = buffer;
          file.filename = filename;
        }),
      );
    }
    return next.handle();
  }
}
