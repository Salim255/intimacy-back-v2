import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from '../user-dto/create-user-dto';
import {
  CreateUserResponseDto,
  LoginUserResponseDto,
} from '../user-dto/create-user-response-dto';
import { GetUserResponseDto, LoginUserDto } from '../user-dto/login-user-dto';
import {
  UpdateUserDto,
  UpdatedUserResponseDto,
} from '../user-dto/update-user-dto';
import { UserDto } from '../user-dto/user-dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { filterObj } from '../../../utils/object-filter';
import { Request } from 'express';
import { FileUploadService } from '../../../common/file-upload/file-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResizePhotoInterceptor } from '../../../common/file-upload/interceptors/resize-photo.interceptor';
import { UploadToS3Interceptor } from '../../../common/file-upload/interceptors/upload-to-s3.interceptor';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new you user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: CreateUserResponseDto,
  })
  async signup(@Body() body: CreateUserDto) {
    const { email, password, private_key, public_key } = body;
    const response = await this.usersService.signup({
      email,
      password,
      private_key,
      public_key,
    });

    return {
      status: 'success',
      data: response,
    };
  }

  @HttpCode(200)
  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 200,
    description: 'User logged successfully',
    type: CreateUserResponseDto,
  })
  async login(@Body() body: LoginUserDto): Promise<LoginUserResponseDto> {
    const { email, password } = body;
    const user = await this.usersService.login({ email, password });
    return {
      status: 'success',
      data: user,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: `Get user with it's id` })
  @ApiParam({ name: 'userId', description: `User's to fetch id` })
  @ApiResponse({
    status: 200,
    description: 'Fetched user with success',
    type: GetUserResponseDto,
  })
  async getUser(@Req() req: Request): Promise<GetUserResponseDto> {
    const userId = req.user as { id: number };
    // Fetch the current user from the database
    const savedUser: UserDto = await this.usersService.getUserById(userId.id);
    return {
      status: 'success',
      data: {
        user: savedUser,
      },
    };
  }

  @Patch('update-me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(
    FileInterceptor('photo', new FileUploadService().getMulterOptions()),
    ResizePhotoInterceptor,
    UploadToS3Interceptor,
  )
  @ApiOperation({ summary: 'Update user' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UpdatedUserResponseDto,
  })
  async updateMe(
    @Body() body: UpdateUserDto,
    @Req() req: Request,
  ): Promise<UpdatedUserResponseDto> {
    try {
      const filteredBody = filterObj(
        body,
        'first_name',
        'last_name',
        'avatar',
        'connection_status',
      );

      if (req.file) {
        filteredBody.avatar = req.file.filename;
      }
      const { id: userId } = req.user as { id: number };
      // Dynamically construct the update query clause
      const values: (string | number)[] = [];
      const fields: string[] = [];
      let query = 'UPDATE users SET ';
      Object.keys(filteredBody).forEach((key, index) => {
        // Exclude id key from being updated
        if (key !== 'id' && filteredBody[key] !== undefined) {
          fields.push(`${key} = $${index + 1}`);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          values.push(filteredBody[key]);
        }
      });

      // Build and Add WHERE clause and append ID to the values
      query += `${fields.join(', ')} WHERE id = $${values.length + 1} RETURNING *;`;
      values.push(userId);

      // Update user document
      const updatedUser: UserDto = await this.usersService.updateUser({
        userId: userId,
        query,
        values,
      });

      return {
        status: 'success',
        data: {
          user: {
            id: updatedUser.id,
            connection_status: updatedUser.connection_status,
          },
        },
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '';
      throw new HttpException(
        {
          status: 'fail',
          message: 'fail to update ' + errorMessage,
          code: 'UPDATE_ME_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':userId/')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Disable user' })
  @ApiParam({ name: 'userId', description: `User's to disable id` })
  @ApiResponse({
    status: 201,
    description: 'User disabled with success',
    schema: {
      example: { is_active: false },
    },
  })
  disable() {
    return 'Hello from disable';
  }
}
