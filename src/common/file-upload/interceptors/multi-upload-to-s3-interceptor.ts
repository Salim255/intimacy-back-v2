import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, forkJoin, from } from 'rxjs';
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';
import { catchError, mergeMap } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MultiUploadToS3Interceptor implements NestInterceptor {
  private s3: S3Client;
  private bucket: string = 'intimacy-s3';
  constructor(private configService: ConfigService) {
    // Initialize the S3 client here with ConfigService
    this.s3 = new S3Client({
      region: this.configService.get<string>('REGION'), // Access AWS region from config
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        )!,
      },
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context
      .switchToHttp()
      .getRequest<{ files?: Express.Multer.File }>();

    // Check if file exists
    const files = (req.files || []) as Express.Multer.File[];
    if (!files) {
      return next.handle(); // No file to upload
    }
    const uploadObservables = files.map((file) => {
      const key = `users/${file.filename}`;
      // Define upload parameters for S3
      const uploadParams = {
        Bucket: this.bucket,
        Key: key, // The file name in the S3 bucket
        Body: file.buffer, // The file's buffer from memory
        ContentType: file.mimetype, // The file's MIME type
        ACL: 'public-read' as ObjectCannedACL, // Set file to public-read
      };

      // Create the command to upload the file to S3
      const command = new PutObjectCommand(uploadParams);

      // RxJS `from` to convert the promise to an observable, then handle errors
      return from(this.s3.send(command)).pipe(
        catchError((error) => {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Unknown error occurred during file upload.';
          // Handle specific errors if needed, such as AWS service-related issues
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          if (error.message.includes('Access Denied')) {
            throw new HttpException(
              {
                status: 'fail',
                message: 'Access denied when trying to upload the file to S3.',
                code: 'S3_ACCESS_DENIED',
              },
              HttpStatus.FORBIDDEN,
            );
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          } else if (error.message.includes('BucketNotFound')) {
            throw new HttpException(
              {
                status: 'fail',
                message: 'The specified S3 bucket could not be found.',
                code: 'S3_BUCKET_NOT_FOUND',
              },
              HttpStatus.NOT_FOUND,
            );
          } else {
            // Generic error for any other issue
            throw new HttpException(
              {
                status: 'fail',
                message: 'Error uploading to S3: ' + errorMessage,
                code: 'S3_UPLOAD_FAILED',
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        }),
      );
    });

    // To wait for every inner observable to complete in paralle
    return forkJoin(uploadObservables).pipe(mergeMap(() => next.handle()));
  }
}
