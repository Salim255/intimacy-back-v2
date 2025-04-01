import * as request from 'supertest';
import { TestContext } from '../test/context'; // Import TestContext
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';

describe('user e2e (e2e)', () => {
  let context: TestContext;
  let app: INestApplication;

  beforeAll(async () => {
    // Initialize test database context
    context = await TestContext.build();
    // Dynamically configure the database connection for this test
    const databaseUrl = context.getConnectionString();
    console.log(databaseUrl, 'Hello database url');
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
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    // Fetch TypeORM DataSource to verify the database connection
    const dataSource = app.get(DataSource);
    console.log('Database Connection Options:', dataSource.options);
  });

  afterAll(async () => {
    console.log(context, 'hello context');
    await context.close(); // Clean up test database

    // Properly close the NestJS application to ensure all connections shut down
    if (app) {
      await app.close();
    }
  });

  it('should', () => {
    expect(1).toEqual(1);
  });
});
