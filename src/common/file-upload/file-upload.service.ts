import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { memoryStorage, Options } from 'multer';

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
}
