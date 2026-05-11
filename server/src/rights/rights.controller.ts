import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RightsService } from './rights.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@ApiTags('Rights')
@ApiBearerAuth()
@Controller('rights')
export class RightsController {
  constructor(private readonly service: RightsService) {}

  @Get()
  @ApiOperation({ summary: 'List all rights', description: 'Returns all permission rights. Requires ADMIN role.' })
  @ApiResponse({ status: 200, description: 'List of rights.' })
  findAll() { return this.service.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get right by ID', description: 'Returns a single right by ID. Requires ADMIN role.' })
  @ApiParam({ name: 'id', type: Number, description: 'Right ID' })
  @ApiResponse({ status: 200, description: 'The right.' })
  @ApiResponse({ status: 404, description: 'Right not found.' })
  findOne(@Param('id') id: string) { return this.service.findOne(+id); }

  @Post()
  @ApiOperation({ summary: 'Create a right', description: 'Creates a new permission right. Requires ADMIN role.' })
  @ApiResponse({ status: 201, description: 'Right created.' })
  create(@Body() body: any) { return this.service.create(body); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a right', description: 'Deletes a right by ID. Requires ADMIN role.' })
  @ApiParam({ name: 'id', type: Number, description: 'Right ID' })
  @ApiResponse({ status: 200, description: 'Right deleted.' })
  @ApiResponse({ status: 404, description: 'Right not found.' })
  remove(@Param('id') id: string) { return this.service.remove(+id); }
}
