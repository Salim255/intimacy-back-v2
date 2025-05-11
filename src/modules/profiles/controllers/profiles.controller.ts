import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
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
} from '../profile-dto/profile-dto';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from 'src/common/file-upload/file-upload.service';
import { ResizeMultiPhotosInterceptor } from 'src/common/file-upload/interceptors/resize-multi-photos.interceptor';
import { MultiUploadToS3Interceptor } from 'src/common/file-upload/interceptors/multi-upload-to-s3-interceptor';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(
    FilesInterceptor('photos', 4, new FileUploadService().getMulterOptions()),
    ResizeMultiPhotosInterceptor,
    MultiUploadToS3Interceptor,
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
      const { name, birthDate, gender, country, city, interestedIn } =
        req.body as CreateProfileDto;

      const payload: CreateProfileDto = {
        name,
        birthDate: birthDate,
        gender,
        country,
        city,
        interestedIn,
        photos: (req.files as Express.Multer.File[])?.map(
          (file) => file.filename,
        ),
      };
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
}
