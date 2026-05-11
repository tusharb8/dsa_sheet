import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Progress')
@Controller('progress')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ProgressController {
  constructor(private readonly service: ProgressService) {}

  @Post('solved/:problemId')
  @ApiOperation({ summary: 'Mark problem as solved', description: 'Marks a problem as solved for the authenticated user.' })
  @ApiParam({ name: 'problemId', type: Number, description: 'Problem ID to mark as solved' })
  @ApiResponse({ status: 201, description: 'Problem marked as solved.' })
  @ApiResponse({ status: 409, description: 'Already marked solved.' })
  markSolved(@Request() req: any, @Param('problemId') pid: string) {
    return this.service.markSolved(req.user.id, +pid);
  }

  @Get('report')
  @ApiOperation({ summary: 'Get own progress report', description: 'Returns the solved/total counts and list of solved problems for the authenticated user.' })
  @ApiResponse({ status: 200, description: 'Progress report.' })
  report(@Request() req: any) {
    return this.service.getUserProgress(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get('report/:userId')
  @ApiOperation({ summary: 'Get any user progress report (Admin)', description: 'Returns progress report for a specific user. Requires ADMIN role.' })
  @ApiParam({ name: 'userId', type: Number, description: 'User ID to get progress for' })
  @ApiResponse({ status: 200, description: 'User progress report.' })
  reportForUser(@Param('userId') userId: string) {
    return this.service.getUserProgress(+userId);
  }

  @Get('daily')
  @ApiOperation({ summary: 'Get own daily stats', description: 'Returns daily solved counts and current streak for the authenticated user.' })
  @ApiResponse({ status: 200, description: 'Daily stats.' })
  daily(@Request() req: any) {
    return this.service.getDailyStats(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get('daily/:userId')
  @ApiOperation({ summary: 'Get any user daily stats (Admin)', description: 'Returns daily stats for a specific user. Requires ADMIN role.' })
  @ApiParam({ name: 'userId', type: Number, description: 'User ID to get daily stats for' })
  @ApiResponse({ status: 200, description: 'User daily stats.' })
  dailyForUser(@Param('userId') userId: string) {
    return this.service.getDailyStats(+userId);
  }

  @Get('resume')
  @ApiOperation({ summary: 'Get own next unsolved problem', description: 'Returns the first unsolved problem for the authenticated user.' })
  @ApiResponse({ status: 200, description: 'Next unsolved problem.' })
  resume(@Request() req: any) {
    return this.service.resume(req.user.id);
  }
}
