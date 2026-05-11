import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProblemService } from './problem.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Problems')
@Controller('problems')
export class ProblemController {
  constructor(private readonly service: ProblemService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all problems', description: 'Returns all problems ordered by topic and index.' })
  @ApiResponse({ status: 200, description: 'List of problems.' })
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get problem by ID', description: 'Returns a single problem with its topic.' })
  @ApiParam({ name: 'id', type: Number, description: 'Problem ID' })
  @ApiResponse({ status: 200, description: 'The problem.' })
  @ApiResponse({ status: 404, description: 'Problem not found.' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a problem', description: 'Creates a new problem. Requires ADMIN role.' })
  @ApiResponse({ status: 201, description: 'Problem created.' })
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a problem', description: 'Updates an existing problem. Requires ADMIN role.' })
  @ApiParam({ name: 'id', type: Number, description: 'Problem ID' })
  @ApiResponse({ status: 200, description: 'Problem updated.' })
  @ApiResponse({ status: 404, description: 'Problem not found.' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(+id, body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a problem', description: 'Deletes a problem by ID. Requires ADMIN role.' })
  @ApiParam({ name: 'id', type: Number, description: 'Problem ID' })
  @ApiResponse({ status: 200, description: 'Problem deleted.' })
  @ApiResponse({ status: 404, description: 'Problem not found.' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
