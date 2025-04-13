import {
  Body,
  Controller,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AcceptMatchRequestResponseDto,
  InitiateMatchDto,
  InitiateMatchResponseDto,
} from '../matches-dto/matches-dto';
import { MatchesService } from '../services/matches.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  AcceptMatchPayload,
  InitiateMatchInput,
} from '../repository/match.repository';
import { Request } from 'express';
import { Match } from '../entities/match.entity';

@ApiTags('matches')
@Controller('matches')
export class MatchesController {
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
    const match: Match =
      await this.matchesService.initiateMatch(initiateMatchPayload);
    return {
      status: 'Success',
      data: { match },
    };
  }

  @Patch(':matchId/accept')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ description: 'Accepted match request' })
  @ApiResponse({ type: AcceptMatchRequestResponseDto })
  async acceptMatch(
    @Param('toUserId') toUserId: number,
    @Param('matchId') matchId: number,
    @Req() req: Request,
  ) {
    const { id: userId } = req.user as { id: number };
    const acceptMatchPayload: AcceptMatchPayload = {
      matchId,
      userId,
    };
    const match = await this.matchesService.acceptMatch(acceptMatchPayload);

    return {
      status: 'Success',
      data: { match },
    };
  }
}
