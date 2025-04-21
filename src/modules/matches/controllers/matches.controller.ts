import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AcceptedMatchResponseDto,
  FetchMatchesResponseDto,
  InitiateMatchDto,
  InitiateMatchResponseDto,
  MatchDto,
} from '../matches-dto/matches-dto';
import { MatchesService } from '../services/matches.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  AcceptMatchPayload,
  InitiateMatchInput,
  MatchDetails,
} from '../repository/match.repository';
import { Request } from 'express';

@ApiTags('Matches')
@Controller('matches')
export class MatchesController {
  private logger = new Logger('MatchesController');
  constructor(private readonly matchesService: MatchesService) {}

  @Post('initiate-match')
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  @ApiOperation({
    description: 'Initiate a potential match',
  })
  @ApiBody({ type: InitiateMatchDto })
  @ApiResponse({ type: InitiateMatchResponseDto })
  async initiateMatch(
    @Req() req: Request,
    @Body() body: InitiateMatchDto,
  ): Promise<InitiateMatchResponseDto> {
    const { id: fromUserId } = req.user as { id: number };
    const toUserId = body.to_user_id;
    const initiateMatchPayload: InitiateMatchInput = {
      toUserId,
      fromUserId,
    };

    const match: MatchDto =
      await this.matchesService.initiateMatch(initiateMatchPayload);
    const response: InitiateMatchResponseDto = {
      status: 'Success',
      data: {
        match,
      },
    };
    this.logger.log(response);
    return response;
  }

  @Patch(':matchId/accept')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ description: 'Accepted match request' })
  @ApiResponse({ type: AcceptedMatchResponseDto })
  async acceptMatch(@Param('matchId') matchId: number, @Req() req: Request) {
    const { id: userId } = req.user as { id: number };
    const acceptMatchPayload: AcceptMatchPayload = {
      matchId: Number(matchId),
      userId,
    };
    const match = await this.matchesService.acceptMatch(acceptMatchPayload);

    return {
      status: 'Success',
      data: { match },
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ description: `Fetch all current user's matches` })
  @ApiResponse({ type: FetchMatchesResponseDto })
  async fetchMatches(@Req() req: Request) {
    const { id: userId } = req.user as { id: number };
    const matches: MatchDetails[] =
      await this.matchesService.getMatches(userId);
    return {
      status: 'Success',
      data: { matches },
    };
  }
}
