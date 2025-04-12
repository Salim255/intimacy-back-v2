import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  InitiateMatchDto,
  InitiateMatchResponseDto,
} from '../matches-dto/matches-dto';
import { MatchesService } from '../services/matches.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { InitiateMatchInput } from '../repository/match.repository';
import { Request } from 'express';

@ApiTags('matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post('')
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
    const match = await this.matchesService.initiateMatch(initiateMatchPayload);
    return {
      status: 'Success',
      data: { match },
    };
  }
}
