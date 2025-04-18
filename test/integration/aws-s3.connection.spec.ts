import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
dotenv.config();

describe('S3 Connectivity (Real Connection)', () => {
  let s3Client: S3Client;

  beforeAll(() => {
    s3Client = new S3Client({
      region: process.env.REGION || '',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
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
    expect(data.BucketRegion).toEqual(process.env.REGION);
  });
});
