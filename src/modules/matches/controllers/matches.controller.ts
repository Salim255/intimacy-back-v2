import { Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  InitiateMatchDto,
  InitiateMatchResponseDto,
} from '../matches-dto/matches-dto';

@ApiTags('matches')
@Controller('matches')
export class MatchesController {
  @Post('')
  @HttpCode(201)
  @ApiOperation({
    description: 'Initiate a potential match',
  })
  @ApiBody({ type: InitiateMatchDto })
  @ApiResponse({ type: InitiateMatchResponseDto })
  initiateMatch() {
    return 'hello from match';
  }
}
