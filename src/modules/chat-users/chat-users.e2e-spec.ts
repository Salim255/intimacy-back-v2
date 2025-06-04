import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { TestContext } from '../../../test/context'; // Import TestContext
import * as request from 'supertest';
import { CreateUserDto } from '../users/user-dto/create-user-dto';

describe('ChatUsers e2e test (e2e) ', () => {
  let context: TestContext;
  let app: INestApplication;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let user1Auth: { token: string; id: number };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let user2Auth: { token: string; id: number };

  beforeAll(async () => {
    // Initialize test database context
    context = await TestContext.build();
    // Dynamically configure the database connection for this test
    const databaseUrl = context.getConnectionString();
    // Dynamically configure the database connection in the NestJS app
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useFactory({
        factory: () => {
          const dataSource = new DataSource({
            type: 'postgres',
            url: databaseUrl,
            synchronize: true,
          });
          return dataSource;
        },
      })
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();

    // Fetch TypeORM DataSource to verify the database connection
    const dataSource = app.get(DataSource);

    await dataSource.initialize(); // Ensures that the connection is established
  });

  it('app should be defined', () => {
    expect(app).toBeDefined();
  });

  it('should create chat users', async () => {
    // Arrange
    // Step1: Create users
    const createUserDto: CreateUserDto = {
      email: 'user1.doe@example.com',
      password: 'supersecure123!',
      private_key: 'fake-private-key',
      public_key: 'fake-public-key',
    };
    const createUser2Dto: CreateUserDto = {
      email: 'user2.doe@example.com',
      password: 'supersecure123!',
      private_key: 'fake-private-key',
      public_key: 'fake-public-key',
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .post('/users/signup')
      .send(createUserDto)
      .expect(201)
      .then((response) => {
        user1Auth = (response.body as { data: { token: string; id: number } })
          .data;
      });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer())
      .post('/users/signup')
      .send(createUser2Dto)
      .expect(201)
      .then((response) => {
        user2Auth = (response.body as { data: { token: string; id: number } })
          .data;
      });
    // Act
    // Assert
  });

  afterAll(async () => {
    await context.close(); // Clean up test database
    if (app) {
      await app.close();
    }
  });
});
