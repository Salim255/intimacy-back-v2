import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { NextFunction, Request } from 'express';
import multer, { memoryStorage, Options } from 'multer';
import * as crypto from 'crypto';
import sharp from 'sharp';

@Injectable()
export class FileUploadService {
  private readonly multerOptions: Options = {
    // With memory storage, the image will be stored as a buffer
    storage: memoryStorage(),
    fileFilter: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      // The gaol of this function is to test if the uploaded file is an image
      // Then we pass true in cb if all is good or we pass false to cb
      if (file.mimetype.startsWith('image')) {
        console.log(file.mimetype);
        cb(null, true);
      } else {
        cb(
          new HttpException(
            'Only image files are allowed!',
            HttpStatus.BAD_REQUEST,
          ),
          false,
        );
      }
    },
  };

  // Multer upload configuration (memory storage, file filter)
  getMulterOptions(): Options {
    return this.multerOptions;
  }

  // Expecting a single file with the field name 'photo'
  getUploadSingle(fieldName: string) {
    return multer(this.multerOptions).single(fieldName);
  }

  // Image resizing logic using Sharp
  public resizeUserPhoto = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.file) return next();

    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    req.file.filename = `user-${uniqueSuffix}-${Date.now()}.jpg`;

    // Here we get the image buffer (temp)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    sharp(req.file.buffer)
      // This sharp function will create an object on which
      // We can chain multiple methods
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .resize(500, 500)
      // Resize takes the width and the height
      // As we need square images, then the height need to be the same
      // as the width, so this resize will crop the image
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .toFormat('jpeg')
      // Convert the image to jpeg
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .jpeg({ quality: 90 }); // .jpeg() to compress the image

    /*  .toFile(
        path.resolve(__dirname, `../../public/img/users/${req.file.filename}`),
      ); // To Finally write the image into our disk if needed */

    next();
  };
}
