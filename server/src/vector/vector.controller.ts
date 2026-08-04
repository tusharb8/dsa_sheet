import { Controller, Get, Post, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VectorService } from './vector.service';

@ApiTags('Vector')
@Controller('vector')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class VectorController {
  constructor(private readonly service: VectorService) {}

  @Get('status')
  @ApiOperation({ summary: 'Vector store status', description: 'Reports Qdrant availability, collection info, and indexed point count.' })
  status() {
    return this.service.status();
  }

  @Post('reindex')
  @ApiOperation({ summary: 'Reindex all problems and resources', description: 'Embeds every problem/resource and upserts them into the Qdrant collection.' })
  @ApiResponse({ status: 201, description: 'Reindex result.' })
  reindex() {
    return this.service.reindexAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Semantic search', description: 'Embeds a query and returns the closest problems/resources.' })
  async search(
    @Query('q') q: string,
    @Query('limit') limit?: string,
    @Query('type') type?: 'problem' | 'resource',
  ) {
    if (!q) throw new BadRequestException('Query parameter "q" is required');
    return this.service.search(q, limit ? Number(limit) : 8, type);
  }
}
