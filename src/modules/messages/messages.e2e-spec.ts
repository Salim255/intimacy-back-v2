import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { TestContext } from '../../../test/context'; // Import TestContext

describe('Message e2e test (e2e) ', () => {
  let context: TestContext;
  let app: INestApplication;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  afterAll(async () => {
    await context.close(); // Clean up test database
    if (app) {
      await app.close();
    }
  });
});
