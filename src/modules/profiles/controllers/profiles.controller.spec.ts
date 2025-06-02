import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';

const mockProfileController = {
  createProfile: jest.fn(),
};

describe('ProfileController test', () => {
  let controller: ProfilesController;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ProfilesController,
          useValue: mockProfileController,
        },
      ],
    }).compile();
    controller = module.get<ProfilesController>(ProfilesController);
  });

  it('should bed defined', () => {
    expect(controller).toBeDefined();
  });
});
