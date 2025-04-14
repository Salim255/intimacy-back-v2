import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { TestContext } from '../../../../test/context';
import { DataSource } from 'typeorm';
import { CreateUserDto } from 'src/modules/users/user-dto/create-user-dto';
import * as request from 'supertest';
import { CreateUserResponseDto } from 'src/modules/users/user-dto/create-user-response-dto';
import {
  AcceptMatchResponseDto,
  FetchMatchesResponseDto,
  InitiateMatchResponseDto,
} from '../matches-dto/matches-dto';

describe('Match e2e test (e2e)', () => {
  let context: TestContext;
  let app: INestApplication;
  let user1Token: string;
  let user2Token: string;
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

  it('should send match request', async () => {
    // Arrange
    const createUser1Dto: CreateUserDto = {
      email: 's@example.com',
      password: 'supersecure123!',
      first_name: 'Salim',
      last_name: 'Salim',
      private_key: 'fake-private-key',
      public_key: 'fake-public-key',
    };
    const createUser2Dto: CreateUserDto = {
      email: 'h@example.com',
      password: 'supersecure123!',
      first_name: 'Hassan',
      last_name: 'Hassan',
      private_key: 'fake-private-key',
      public_key: 'fake-public-key',
    };

    // Act
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const user1 = await request(app.getHttpServer())
      .post('/users/signup')
      .send(createUser1Dto)
      .expect(201);

    user1Token = (user1.body as CreateUserResponseDto).data.token;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const user2 = await request(app.getHttpServer())
      .post('/users/signup')
      .send(createUser2Dto)
      .expect(201);

    user2Token = (user2.body as CreateUserResponseDto).data.token;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const initiateMatchResponse = await request(app.getHttpServer())
      .post('/matches/initiate-match')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        to_user_id: 2,
      })
      .expect(201);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const acceptMatchResponse = await request(app.getHttpServer())
      .patch('/matches/1/accept')
      .set('Authorization', `Bearer ${user2Token}`)
      .expect(200);

    // Assert
    expect(user1Token).toBeDefined();
    expect(user2Token).toBeDefined();
    expect(initiateMatchResponse.body).toHaveProperty('data');
    expect(initiateMatchResponse.body).toHaveProperty('status');
    expect(
      (initiateMatchResponse.body as InitiateMatchResponseDto).status,
    ).toEqual('Success');
    expect(
      (initiateMatchResponse.body as InitiateMatchResponseDto).data.match,
    ).toHaveProperty('id');
    expect(
      (initiateMatchResponse.body as InitiateMatchResponseDto).data.match.id,
    ).toEqual(1);
    expect(
      (initiateMatchResponse.body as InitiateMatchResponseDto).data.match
        .status,
    ).toEqual(1);

    expect(acceptMatchResponse.body).toHaveProperty('data');
    expect(acceptMatchResponse.body).toHaveProperty('status');
    expect((acceptMatchResponse.body as AcceptMatchResponseDto).status).toEqual(
      'Success',
    );
    expect(
      (acceptMatchResponse.body as AcceptMatchResponseDto).data.match.id,
    ).toEqual(1);
    expect(
      (acceptMatchResponse.body as AcceptMatchResponseDto).data.match.status,
    ).toEqual(2);
  });

  it('should fetch matches by user', async () => {
    // Arrange
    // Act
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const matches = await request(app.getHttpServer())
      .get('/matches/')
      .set('Authorization', `Bearer ${user1Token}`)
      .expect(200);

    // Assert
    expect(matches.body).toHaveProperty('data');
    expect(matches.body).toHaveProperty('status');
    expect((matches.body as FetchMatchesResponseDto).status).toEqual('Success');
    expect((matches.body as FetchMatchesResponseDto).data).toHaveProperty(
      'matches',
    );
    expect((matches.body as FetchMatchesResponseDto).data.matches).toHaveLength(
      1,
    );
    expect(
      (matches.body as FetchMatchesResponseDto).data.matches[0].match_id,
    ).toEqual(1);
    expect(
      (matches.body as FetchMatchesResponseDto).data.matches[0].match_status,
    ).toEqual(2);
  });

  afterAll(async () => {
    await context.close();
    if (app) {
      await app.close();
    }
  });
});
