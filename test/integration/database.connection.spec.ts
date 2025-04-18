import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';

describe('Database Connection (Integration Test)', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
  });

  it('should connect to the database', () => {
    const isInitialized = dataSource.isInitialized;
    expect(isInitialized).toBe(true);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });
});
