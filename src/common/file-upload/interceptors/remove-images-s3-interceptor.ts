import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, from, of } from 'rxjs';
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RemoveImagesFromToS3Interceptor implements NestInterceptor {
  private s3: S3Client;
  private bucket: string = 'intimacy-s3';
  private logger = new Logger('RemoveImages');

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
    // Extract request, files and user ID from context
    const req = context
      .switchToHttp()
      .getRequest<{ files?: Express.Multer.File[]; user: { id: number } }>();

    // Check if file exists
    const files = req.files || [];
    const userId = req.user?.id;

    // If no files or user, skip and proceed
    if (!files || !userId) {
      return next.handle();
    }

    // Get the list of filenames from the current upload
    const uploadedFileKeys = files.map((file) => `users/${file.filename}`);
    this.logger.warn(userId, uploadedFileKeys);
    // List all existing objects in the user's folder
    const listCommand = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: `users/user-${userId}`,
    });

    return from(this.s3.send(listCommand)).pipe(
      switchMap((listResult) => {
        // Extract existing keys from S3 listing response
        const existingKeys = listResult.Contents?.map((obj) => obj.Key!) || [];

        // Determine which existing keys should be deleted (not part of the current upload)
        const keysToDelete = existingKeys.filter(
          (key) => !uploadedFileKeys.includes(key),
        );

        // If no files to delete, skip deletion
        if (keysToDelete.length === 0) return of(null);

        // Create delete command with the keys to be removed
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: this.bucket,
          Delete: {
            Objects: keysToDelete.map((Key) => ({ Key })),
          },
        });
        // Send delete command to S3
        return from(this.s3.send(deleteCommand)).pipe(
          catchError((error: Error) => {
            this.logger.warn(userId, keysToDelete);
            const errMessage = error ? error.message : 'unknown';
            throw new HttpException(
              {
                status: 'fail',
                message: 'Failed to delete old images from S3. ' + errMessage,
                code: 'ERROR_DELETE_FILES',
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        );
      }),
      // Proceed to next request handler regardless of deletion outcome
      mergeMap(() => next.handle()),
    );
  }
}
