import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { TestContext } from '../../test/context'; // Ensure this path is correct and TestContext is properly exported and typed

let testContext: TestContext;
beforeAll(async () => {
  testContext = await TestContext.build();
  console.log(testContext, 'Hello from context');
});

describe('UsersController e2e test', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

afterAll(() => {
  return testContext.close();
});
