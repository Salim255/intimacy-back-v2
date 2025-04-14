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
import { CreateUserResponseDto } from '../user-dto/create-user-response-dto';
import { GetUserResponseDto, LoginUserDto } from '../user-dto/login-user-dto';
import {
  UpdateUserDto,
  UpdatedUserResponseDto,
  UserDto,
} from '../user-dto/update-user-dto';
import * as passwordHandler from '../../auth/password-handler';
import { UserKeysService } from '../../user-keys/services/user-keys.service';
import {
  JwtTokenService,
  JwtTokenPayload,
} from '../../auth/jws-token-service';
import { DataSource } from 'typeorm';
import { PasswordComparisonPayload } from '../../auth/password-handler';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { filterObj } from '../../../utils/object-filter';
import { Request } from 'express';
import { FileUploadService } from '../../../common/file-upload/file-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResizePhotoInterceptor } from '../../../common/file-upload/interceptors/resize-photo.interceptor';
import { UploadToS3Interceptor } from '../../../common/file-upload/interceptors/upload-to-s3.interceptor';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly userKeysService: UserKeysService,
    private readonly usersService: UsersService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly dataSource: DataSource, // Inject the DataSource here
    private readonly fileUploadService: FileUploadService,
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
    //const ds = this.dataSource; // inject it
    //console.log('🧪 Current DB URL', ds.options['url']);
    try {
      const {
        email,
        password,
        first_name,
        last_name,
        private_key,
        public_key,
      } = body;

      const hashedPassword = await passwordHandler.hashedPassword(password);
      const createdUser = await this.usersService.createUser({
        email,
        password: hashedPassword,
        first_name,
        last_name,
      });

      // Create usr keys
      const userKeys = await this.userKeysService.createUserKeys({
        user_id: createdUser.id,
        public_key,
        encrypted_private_key: private_key,
      });
      const token = this.jwtTokenService.createToken(createdUser.id);

      const tokenDetails: JwtTokenPayload =
        this.jwtTokenService.verifyToken(token);

      return {
        status: 'success',
        data: {
          token,
          id: tokenDetails.id,
          expireIn: tokenDetails.exp,
          privateKey: userKeys.encrypted_private_key,
          publicKey: userKeys.public_key,
          email: createdUser.email,
        },
      };
    } catch (err) {
      console.log(err);
      const errorMessage = err instanceof Error ? err.message : '';
      throw new HttpException(
        {
          status: 'fail',
          message: 'User creation failed: ' + errorMessage,
          code: 'USER_CREATE_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
  async login(@Body() body: LoginUserDto): Promise<CreateUserResponseDto> {
    try {
      const { email, password } = body;
      const user = await this.usersService.getUser(email);
      if (!user) {
        throw new HttpException(
          {
            status: 'fail',
            message: 'User not found',
            code: 'USER_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      const passwords: PasswordComparisonPayload = {
        plainPassword: password,
        hashedPassword: user.password,
      };
      const isPasswordValid = await passwordHandler.correctPassword(passwords);

      if (!isPasswordValid) {
        throw new HttpException(
          {
            status: 'fail',
            message: 'Invalid password',
            code: 'INVALID_PASSWORD',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      const token = this.jwtTokenService.createToken(user.id);
      const tokenDetails: JwtTokenPayload =
        this.jwtTokenService.verifyToken(token);

      return {
        status: 'success',
        data: {
          token,
          id: Number(tokenDetails.id),
          expireIn: tokenDetails.exp,
          privateKey: user.encrypted_private_key,
          publicKey: user.public_key,
          email: user.email,
        },
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '';
      throw new HttpException(
        {
          status: 'fail',
          message: 'User login failed' + errorMessage,
          code: 'USER_LOGIN_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
    try {
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
      };
    } catch (error) {
      console.log(error);
      const errorMessage = error instanceof Error ? error.message : '';
      throw new HttpException(
        {
          status: 'fail',
          message: 'fail to fetch user ' + errorMessage,
          code: 'FETCH_USER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
