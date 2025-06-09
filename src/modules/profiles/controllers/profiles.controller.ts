import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProfilesService } from '../services/profiles.service';
import {
  CreatedProfileResponseDto,
  CreateProfileDto,
  GetProfileResponseDto,
  ProfileDto,
  UpdateAgeRangeBodyDto,
  UpdateBioBodyDto,
  UpdateChildrenBodyDto,
  UpdateCoordinatesBodyDto,
  UpdateDistanceRangeBodyDto,
  UpdateEducationBodyDto,
  UpdateGenderBodyDto,
  UpdateHeightBodyDto,
  UpdateHomeBodyDto,
  UpdateInterestsBodyDto,
  UpdateLookingForBodyDto,
  UpdatePhotosBodyDto,
} from '../profile-dto/profile-dto';
import { JwtAuthGuard } from '../../../modules/auth/jwt-auth.guard';
import { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from '../../../common/file-upload/file-upload.service';
import { ResizeMultiPhotosInterceptor } from '../../../common/file-upload/interceptors/resize-multi-photos.interceptor';
import { MultiUploadToS3Interceptor } from '../../../common/file-upload/interceptors/multi-upload-to-s3-interceptor';
import { RemoveImagesFromToS3Interceptor } from '../../../common/file-upload/interceptors/remove-images-s3-interceptor';
import { GoogleHomeInterceptor } from '../../../common/file-upload/interceptors/google-home-interceptor';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  private logger = new Logger('ProfilesController');
  constructor(private profilesService: ProfilesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(
    FilesInterceptor('photos', 4, new FileUploadService().getMulterOptions()),
    ResizeMultiPhotosInterceptor,
    MultiUploadToS3Interceptor,
    GoogleHomeInterceptor,
  )
  @ApiConsumes('multipart/form-data')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create user profile' })
  @ApiBody({ type: CreateProfileDto })
  @ApiResponse({
    status: 201,
    description: 'Create profile response',
    type: CreatedProfileResponseDto,
  })
  async createProfile(@Req() req: Request): Promise<CreatedProfileResponseDto> {
    try {
      // 1) Pull your DTO-like fields from req.body
      const {
        name,
        birthDate,
        gender,
        country,
        city,
        interestedIn,
        latitude,
        longitude,
      } = req.body as CreateProfileDto;

      const payload: CreateProfileDto = {
        name,
        birthDate: birthDate,
        gender,
        country,
        city,
        interestedIn,
        latitude,
        longitude,
        photos: (req.files as Express.Multer.File[])?.map(
          (file) => file.filename,
        ),
      };

      console.log(payload);
      const { id: userId } = req.user as { id: number };
      const createdProfile: ProfileDto =
        await this.profilesService.createProfile(payload, userId);
      return {
        status: 'Success',
        data: { profile: createdProfile },
      };
    } catch (error) {
      const messageError =
        error instanceof Error ? error.message : 'unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Fails to create user profile ' + messageError,
          code: 'ERROR_CREATE_POST',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: `Get profile with user id` })
  @ApiResponse({
    status: 200,
    description: 'Fetched profile with success',
    type: GetProfileResponseDto,
  })
  async getProfile(@Req() req: Request): Promise<GetProfileResponseDto> {
    const { id: userId } = req.user as { id: number };
    const savedProfile: ProfileDto =
      await this.profilesService.getProfileById(userId);
    return {
      status: 'success',
      data: {
        profile: savedProfile,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('update-location')
  @UseInterceptors(GoogleHomeInterceptor)
  @ApiBody({ type: UpdateCoordinatesBodyDto })
  @ApiResponse({
    status: 200,
    description: 'Updated profile with success',
    type: GetProfileResponseDto,
  })
  async updateLocation(@Req() req: Request): Promise<GetProfileResponseDto> {
    try {
      const { profileId, latitude, longitude } =
        req.body as UpdateCoordinatesBodyDto;
      const result = [profileId, latitude, longitude].filter(Boolean);
      if (result.length !== 3) {
        throw new Error();
      }

      const updatedProfile = await this.profilesService.updateProfileLocation({
        profileId,
        latitude,
        longitude,
      });

      return {
        status: 'success',
        data: {
          profile: updatedProfile,
        },
      };
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error while updating profile location ' + errMessage,
          code: 'ERROR_UPDATE_PROFILE',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('update-bio')
  @ApiBody({ type: UpdateBioBodyDto })
  @ApiResponse({
    status: 200,
    description: 'Updated profile with success',
    type: GetProfileResponseDto,
  })
  async updateBio(@Req() req: Request): Promise<GetProfileResponseDto> {
    try {
      const { profileId, bio } = req.body as UpdateBioBodyDto;
      const result = [profileId, bio].filter(Boolean);
      if (result.length !== 2) {
        throw new Error();
      }

      const updatedProfile = await this.profilesService.updateBio({
        profileId,
        bio,
      });

      return {
        status: 'success',
        data: {
          profile: updatedProfile,
        },
      };
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error while updating profile bio ' + errMessage,
          code: 'ERROR_UPDATE_PROFILE',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('update-home')
  @ApiBody({ type: UpdateHomeBodyDto })
  @ApiResponse({
    status: 200,
    description: 'Updated profile home with success',
    type: GetProfileResponseDto,
  })
  async updateHome(@Req() req: Request): Promise<GetProfileResponseDto> {
    try {
      const { profileId, city, country } = req.body as UpdateHomeBodyDto;
      const result = [profileId, city, country].filter(Boolean);
      if (result.length !== 3) {
        throw new Error();
      }

      const updatedProfile = await this.profilesService.updateHome({
        profileId,
        city,
        country,
      });

      return {
        status: 'success',
        data: {
          profile: updatedProfile,
        },
      };
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error while updating profile home ' + errMessage,
          code: 'ERROR_UPDATE_PROFILE',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('update-children')
  @ApiBody({ type: UpdateChildrenBodyDto })
  @ApiResponse({
    status: 200,
    description: 'Updated profile children with success',
    type: GetProfileResponseDto,
  })
  async updateChildren(@Req() req: Request): Promise<GetProfileResponseDto> {
    try {
      const { profileId, status } = req.body as UpdateChildrenBodyDto;
      const result = [profileId, status].filter(Boolean);
      if (result.length !== 2) {
        throw new Error();
      }

      const updatedProfile = await this.profilesService.updateChildren({
        profileId,
        status,
      });

      return {
        status: 'success',
        data: {
          profile: updatedProfile,
        },
      };
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error while updating profile children ' + errMessage,
          code: 'ERROR_UPDATE_PROFILE',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('update-education')
  @ApiBody({ type: UpdateEducationBodyDto })
  @ApiResponse({
    status: 200,
    description: 'Updated profile education with success',
    type: GetProfileResponseDto,
  })
  async updateEducation(@Req() req: Request): Promise<GetProfileResponseDto> {
    try {
      const { profileId, education } = req.body as UpdateEducationBodyDto;
      const result = [profileId, education].filter(Boolean);
      if (result.length !== 2) {
        throw new Error();
      }

      const updatedProfile = await this.profilesService.updateEducation({
        profileId,
        education,
      });

      return {
        status: 'success',
        data: {
          profile: updatedProfile,
        },
      };
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error while updating profile education ' + errMessage,
          code: 'ERROR_UPDATE_PROFILE',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('update-gender')
  @ApiBody({ type: UpdateGenderBodyDto })
  @ApiResponse({
    status: 200,
    description: 'Updated profile gender with success',
    type: GetProfileResponseDto,
  })
  async updateGender(@Req() req: Request): Promise<GetProfileResponseDto> {
    try {
      const { profileId, gender } = req.body as UpdateGenderBodyDto;
      const result = [profileId, gender].filter(Boolean);
      if (result.length !== 2) {
        throw new Error();
      }

      const updatedProfile = await this.profilesService.updateGender({
        profileId,
        gender,
      });

      return {
        status: 'success',
        data: {
          profile: updatedProfile,
        },
      };
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error while updating profile gender ' + errMessage,
          code: 'ERROR_UPDATE_PROFILE',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('update-height')
  @ApiBody({ type: UpdateHeightBodyDto })
  @ApiResponse({
    status: 200,
    description: 'Updated profile height with success',
    type: GetProfileResponseDto,
  })
  async updateHeight(@Req() req: Request): Promise<GetProfileResponseDto> {
    try {
      const { profileId, height } = req.body as UpdateHeightBodyDto;
      const result = [profileId, height].filter(Boolean);
      if (result.length !== 2) {
        throw new Error();
      }

      const updatedProfile = await this.profilesService.updateHeight({
        profileId,
        height,
      });

      return {
        status: 'success',
        data: {
          profile: updatedProfile,
        },
      };
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error while updating profile height ' + errMessage,
          code: 'ERROR_UPDATE_PROFILE',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('update-interests')
  @ApiBody({ type: UpdateInterestsBodyDto })
  @ApiResponse({
    status: 200,
    description: 'Updated profile interests with success',
    type: GetProfileResponseDto,
  })
  async updateInterests(@Req() req: Request): Promise<GetProfileResponseDto> {
    try {
      const { profileId, interestedIn } = req.body as UpdateInterestsBodyDto;
      const result = [profileId, interestedIn].filter(Boolean);
      if (result.length !== 2) {
        throw new Error(`Missing data for update interest ${result.length}`);
      }

      const updatedProfile = await this.profilesService.updateInterests({
        profileId,
        interestedIn,
      });

      return {
        status: 'success',
        data: {
          profile: updatedProfile,
        },
      };
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error while updating profile interests ' + errMessage,
          code: 'ERROR_UPDATE_PROFILE',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('update-looking-for')
  @ApiBody({ type: UpdateLookingForBodyDto })
  @ApiResponse({
    status: 200,
    description: 'Updated profile looking for with success',
    type: GetProfileResponseDto,
  })
  async updateLookingFor(@Req() req: Request): Promise<GetProfileResponseDto> {
    try {
      const { profileId, lookingFor } = req.body as UpdateLookingForBodyDto;
      const result = [profileId, lookingFor].filter(Boolean);
      if (result.length !== 2) {
        throw new Error(`
          Missing data for update profile looking for ${result.length}`);
      }

      const updatedProfile = await this.profilesService.updateLookingFor({
        profileId,
        lookingFor,
      });

      return {
        status: 'success',
        data: {
          profile: updatedProfile,
        },
      };
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error while updating profile looking for ' + errMessage,
          code: 'ERROR_UPDATE_PROFILE',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(
    FilesInterceptor('photos', 4, new FileUploadService().getMulterOptions()),
    ResizeMultiPhotosInterceptor,
    RemoveImagesFromToS3Interceptor,
    MultiUploadToS3Interceptor,
  )
  @Patch('update-photos')
  @ApiBody({ type: UpdatePhotosBodyDto })
  @ApiResponse({
    status: 200,
    description: 'Updated profile photos  with success',
    type: GetProfileResponseDto,
  })
  async updatePhotos(@Req() req: Request): Promise<GetProfileResponseDto> {
    try {
      const { profileId } = req.body as UpdatePhotosBodyDto;
      const photos = (req.files as Express.Multer.File[])?.map(
        (file) => file.filename,
      );
      const result = [profileId, photos].filter(Boolean);

      if (result.length !== 2) {
        throw new Error(`
          Missing data for update profile update profile  ${result.length}`);
      }

      const updatedProfile = await this.profilesService.updatePhotos({
        profileId,
        photos: (req.files as Express.Multer.File[])?.map(
          (file) => file.filename,
        ),
      });

      return {
        status: 'success',
        data: {
          profile: updatedProfile,
        },
      };
    } catch (error) {
      console.error(error);
      const errMessage =
        error instanceof Error ? error.message : 'unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error while updating profile  photos ' + errMessage,
          code: 'ERROR_UPDATE_PROFILE',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('update-age-range')
  @ApiBody({ type: UpdateAgeRangeBodyDto })
  @ApiResponse({
    status: 200,
    description: 'Updated profile with success',
    type: GetProfileResponseDto,
  })
  async updateAgeRange(@Req() req: Request): Promise<GetProfileResponseDto> {
    try {
      const { profileId, minAge, maxAge } = req.body as UpdateAgeRangeBodyDto;
      const result = [profileId, minAge, maxAge].filter(Boolean);
      if (result.length !== 3) {
        throw new Error(`
          Missing data for update profile update profile  ${result.length}`);
      }

      const updatedProfile = await this.profilesService.updateAgeRange({
        profileId,
        minAge,
        maxAge,
      });

      return {
        status: 'success',
        data: {
          profile: updatedProfile,
        },
      };
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error while updating profile age range ' + errMessage,
          code: 'ERROR_UPDATE_PROFILE',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('update-distance-range')
  @ApiBody({ type: UpdateDistanceRangeBodyDto })
  @ApiResponse({
    status: 200,
    description: 'Updated profile with success',
    type: GetProfileResponseDto,
  })
  async updateDistanceRange(
    @Req() req: Request,
  ): Promise<GetProfileResponseDto> {
    try {
      const { profileId, distanceRange } =
        req.body as UpdateDistanceRangeBodyDto;
      const result = [profileId, distanceRange].filter(Boolean);
      if (result.length !== 2) {
        throw new Error(`
          Missing data for update profile update profile  ${result.length}`);
      }

      const updatedProfile = await this.profilesService.updateDistanceRange({
        profileId,
        distanceRange,
      });

      return {
        status: 'success',
        data: {
          profile: updatedProfile,
        },
      };
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'unknown error';
      throw new HttpException(
        {
          status: 'fail',
          message: 'Error while updating profile distance range ' + errMessage,
          code: 'ERROR_UPDATE_PROFILE',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
