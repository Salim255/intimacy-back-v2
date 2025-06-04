import * as request from 'supertest';
import { TestContext } from '../../../test/context'; // Import TestContext
import { AppModule } from '../../app.module';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { CreateUserDto } from './user-dto/create-user-dto';
import { CreateUserResponseDto } from './user-dto/create-user-response-dto';
import { GetUserResponseDto } from './user-dto/login-user-dto';

describe('User e2e test (e2e)', () => {
  let context: TestContext;
  let app: INestApplication;
  let userToken: string;
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
            synchronize: false,
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

  it('should respond to /ping', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer()).get('/ping').expect(200);
  });

  it('should create user', async () => {
    const createUserDto: CreateUserDto = {
      email: 'jane.doe@example.com',
      password: 'supersecure123!',
      private_key: 'fake-private-key',
      public_key: 'fake-public-key',
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(app.getHttpServer())
      .post('/users/signup')
      .send(createUserDto)
      .expect(201)
      .catch((err) => {
        console.error('Request failed:', err);
        throw err;
      });
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('status');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.status).toEqual('success');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.data.id).toEqual(1);
  });

  it('should login user', async () => {
    // Arrange
    const user = {
      email: 'jane.doe@example.com',
      password: 'supersecure123!',
    };

    // Act
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send(user)
      .expect(200);

    // Assert
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.data.id).toEqual(1);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('status');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.status).toEqual('success');

    userToken = (response.body as CreateUserResponseDto).data.token;
  });

  it('should fetch user by id', async () => {
    // Arrange
    // Act
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    // Assert
    expect((response.body as GetUserResponseDto).data.user.id).toEqual(1);
    expect((response.body as GetUserResponseDto).status).toEqual('success');
  });

  afterAll(async () => {
    if (context) {
      await context.close(); // 🧹 Drops the schema and role, Clean up test database
    }
    userToken = '';
    // Properly close the NestJS application to ensure all connections shut down
    if (app) {
      await app.close();
    }
  });
});
