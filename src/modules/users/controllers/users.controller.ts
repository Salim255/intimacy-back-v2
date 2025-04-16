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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import {
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
  UserDto,
} from '../user-dto/update-user-dto';
import { JwtTokenService } from '../../auth/jws-token-service';
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
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

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
    const { email, password, first_name, last_name, private_key, public_key } =
      body;

    const response = await this.usersService.signup({
      email,
      password,
      first_name,
      last_name,
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

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
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
    @UploadedFile() file: Express.Multer.File,
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
      const userId = req.user as { id: number };
      // Fetch the current user from the database
      const savedUser: UserDto = await this.usersService.getUserById(userId.id);

      if (!savedUser) {
        throw new HttpException(
          {
            status: 'fail',
            message: 'User not found or no longer exists.',
            code: 'USER_NOT_FOUND',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

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

      // If no fields to update, return early
      if (fields.length === 0) {
        return {
          status: 'success',
          data: {
            user: {
              id: savedUser.id,
              first_name: savedUser.first_name,
              last_name: savedUser.last_name,
              connection_status: savedUser.connection_status,
              avatar: savedUser.avatar,
            },
          },
        }; // No changes, return existing data
      }

      // Build and Add WHERE clause and append ID to the values
      query += `${fields.join(', ')} WHERE id = $${values.length + 1} RETURNING *;`;
      values.push(savedUser.id);

      // 3) Update user document
      const updatedUser: UserDto = await this.usersService.updateUser(
        query,
        values,
      );

      return {
        status: 'success',
        data: {
          user: {
            id: updatedUser.id,
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            connection_status: updatedUser.connection_status,
            avatar: updatedUser.avatar,
          },
        },
      };
    } catch (err) {
      console.log(err);
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
