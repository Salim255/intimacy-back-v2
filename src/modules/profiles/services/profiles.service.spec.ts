import { TestingModule, Test } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import {
  CreateProfileDto,
  ProfileDto,
  profileExample,
} from '../profile-dto/profile-dto';
import { Gender, InterestedIn } from '../entities/profile.entity';

const mockProfileService = {
  createProfile: jest.fn(),
};

describe('ProfileService', () => {
  let service: ProfilesService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ProfilesService,
          useValue: mockProfileService,
        },
      ],
    }).compile();
    service = module.get<ProfilesService>(ProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create user profile', async () => {
    // Arrange
    const profilePayload: CreateProfileDto = {
      name: 'salim',
      birthDate: new Date(),
      gender: Gender.Female,
      country: 'france',
      city: 'lille',
      interestedIn: InterestedIn.Both,
      photos: ['photo1', 'photo2'],
    };
    const userId: number = 1;
    const createdProfile: ProfileDto = profileExample;

    // Act
    mockProfileService.createProfile.mockResolvedValue(createdProfile);
    const result: ProfileDto = await service.createProfile(
      profilePayload,
      userId,
    );

    //Assert
    expect(mockProfileService.createProfile).toHaveBeenCalled();
    expect(mockProfileService.createProfile).toHaveBeenCalledTimes(1);
    expect(mockProfileService.createProfile).toHaveBeenCalledWith(
      profilePayload,
      userId,
    );
    expect(result).toEqual(createdProfile);
  });
});
