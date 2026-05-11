import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ResourceService } from './resource.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Resources')
@Controller('resources')
export class ResourceController {
  constructor(private readonly service: ResourceService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all resources', description: 'Returns all resources ordered by topic and index.' })
  @ApiResponse({ status: 200, description: 'List of resources.' })
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get resource by ID', description: 'Returns a single resource with its topic.' })
  @ApiParam({ name: 'id', type: Number, description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'The resource.' })
  @ApiResponse({ status: 404, description: 'Resource not found.' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a resource', description: 'Creates a new resource. Requires ADMIN role.' })
  @ApiResponse({ status: 201, description: 'Resource created.' })
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a resource', description: 'Updates an existing resource. Requires ADMIN role.' })
  @ApiParam({ name: 'id', type: Number, description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'Resource updated.' })
  @ApiResponse({ status: 404, description: 'Resource not found.' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(+id, body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a resource', description: 'Deletes a resource by ID. Requires ADMIN role.' })
  @ApiParam({ name: 'id', type: Number, description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'Resource deleted.' })
  @ApiResponse({ status: 404, description: 'Resource not found.' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
