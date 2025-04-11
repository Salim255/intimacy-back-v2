import { ConfigService } from '@nestjs/config';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

describe('S3 Connectivity (Real Connection)', () => {
  let s3Client: S3Client;
  let configService: ConfigService;
  let app: TestingModule; // NestJS TestingModule

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Access ConfigService from the module
    configService = app.get<ConfigService>(ConfigService);

    s3Client = new S3Client({
      region: configService.get<string>('REGION')!,
      credentials: {
        accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
    });
  });

  it('should connect to S3 and list buckets successfully', async () => {
    // Command to list all buckets in S3
    const healthParams = {
      Bucket: 'intimacy-s3', // Your S3 bucket name
    };
    const command = new HeadBucketCommand(healthParams);

    // Perform the HeadBucket command to check if the bucket is accessible
    const data = await s3Client.send(command);

    // Assert the response
    expect(data.$metadata).toBeDefined();
    expect(data.$metadata.httpStatusCode).toEqual(200);
    expect(data.BucketRegion).toEqual(configService.get<string>('REGION'));
  });

  afterAll(async () => {
    // Clean up resources if necessary
    // No explicit close method is required for S3Client
  });
});
