import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('user-keys')
@Controller('user-keys')
export class UserKeysController {}
