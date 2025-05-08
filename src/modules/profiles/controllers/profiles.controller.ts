import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProfilesService } from '../services/profiles.service';
import {
  CreatedProfileResponseDto,
  CreateProfileDto,
  ProfileDto,
} from '../profile-dto/profile-dto';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create user profile' })
  @ApiBody({ type: CreateProfileDto })
  @ApiResponse({
    status: 201,
    description: 'Create profile response',
    type: CreatedProfileResponseDto,
  })
  async createProfile(
    @Body() body: CreateProfileDto,
  ): Promise<CreatedProfileResponseDto> {
    try {
      const createdProfile: ProfileDto =
        await this.profilesService.createProfile(body);
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
          message: 'Fails to create profile ' + messageError,
          code: 'ERROR_CREATE_POST',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
