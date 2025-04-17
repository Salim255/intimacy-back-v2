import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { TestContext } from '../../../test/context'; // Import TestContext
import * as request from 'supertest';
import { CreateUserDto } from '../users/user-dto/create-user-dto';
import { CreateChatResponseDto } from './chat-dto/chat-response.dto';

describe('Chat e2e test (e2e) ', () => {
  let context: TestContext;
  let app: INestApplication;
  let user1Auth: { token: string, id: number };
  let user2Auth: { token: string, id: number };

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

  it('should create a new chat', async () => {
    // Arrange
    // Step1: Create users
    const createUserDto: CreateUserDto = {
      email: 'user1.doe@example.com',
      password: 'supersecure123!',
      first_name: 'Jane',
      last_name: 'Doe',
      private_key: 'fake-private-key',
      public_key: 'fake-public-key',
    };
    const createUser2Dto: CreateUserDto = {
      email: 'user2.doe@example.com',
      password: 'supersecure123!',
      first_name: 'Jane',
      last_name: 'Doe',
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

    const createChatPayload = {
      content: 'Hello there',
      from_user_id: user2Auth.id,
      to_user_id: user1Auth.id,
      session_key_sender: 'sender_key',
      session_key_receiver: 'reciever_key',
    };
    // Act
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const createdChat = await request(app.getHttpServer())
      .post('/chats')
      .send(createChatPayload)
      .set('Authorization', `Bearer ${user2Auth.token}`)
      .expect(201);

    // Assert
    expect((createdChat.body as CreateChatResponseDto).status).toEqual(
      'Success',
    );
    expect((createdChat.body as CreateChatResponseDto).data.chat.id).toEqual(1);
  });

  afterAll(async () => {
    await context.close(); // Clean up test database
    if (app) {
      await app.close();
    }
  });
});
