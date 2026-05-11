import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TopicService } from './topic.service';

@ApiTags('Topics')
@Controller('topics')
export class TopicController {
  constructor(private readonly service: TopicService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all topics', description: 'Returns all topics with their resources and problems, ordered by orderIndex.' })
  @ApiResponse({ status: 200, description: 'List of topics.' })
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a topic by ID', description: 'Returns a single topic with its resources and problems.' })
  @ApiParam({ name: 'id', type: Number, description: 'Topic ID' })
  @ApiResponse({ status: 200, description: 'The topic.' })
  @ApiResponse({ status: 404, description: 'Topic not found.' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }
}
