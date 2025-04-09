import * as request from 'supertest';
import { TestContext } from '../test/context'; // Import TestContext
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/modules/users/entities/user.entity';
import { CreateUserDto } from 'src/modules/users/user-dto/create-user-dto';

describe('User e2e test (e2e)', () => {
  let context: TestContext;
  let app: INestApplication;

  beforeAll(async () => {
    // Initialize test database context
    context = await TestContext.build();
    // Dynamically configure the database connection for this test
    const databaseUrl = context.getConnectionString();
    // Dynamically configure the database connection in the NestJS app
    const moduleRef = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: 'postgres', // Change this to your database type
          url: databaseUrl, // Use environment variable or a local connection string
          autoLoadEntities: true, // Automatically load entities
          synchronize: true, // Be careful using this in production
          entities: [User],
        }),
      ],
    })
      .overrideProvider(DataSource)
      .useFactory({
        factory: () => {
          const dataSource = new DataSource({
            type: 'postgres',
            url: databaseUrl,
            synchronize: true,
            entities: [User],
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

    // Log the DataSource URL for confirmation
    console.log('✅ Final DB URL in app context:', dataSource.options['url']);
  });

  afterAll(async () => {
    await context.close(); // Clean up test database

    // Properly close the NestJS application to ensure all connections shut down
    if (app) {
      await app.close();
    }
  });

  it('should respond to /ping', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer()).get('/ping').expect(200);
  });

  it('should create user', async () => {
    const createUserDto: CreateUserDto = {
      email: 'jane.doe@example.com',
      password: 'supersecure123!',
      first_name: 'Jane',
      last_name: 'Doe',
      private_key: 'fake-private-key',
      public_key: 'fake-public-key',
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(app.getHttpServer())
      .post('/users/signup')
      .send(createUserDto)
      .expect(201);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('status');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.status).toEqual('success');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.data.id).toEqual(1);
  });
});
