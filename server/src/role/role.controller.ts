import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  constructor(private readonly service: RoleService) {}

  @Get()
  @ApiOperation({ summary: 'List all roles', description: 'Returns all roles with their associated rights. Requires ADMIN role.' })
  @ApiResponse({ status: 200, description: 'List of roles.' })
  findAll() { return this.service.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID', description: 'Returns a single role with its rights. Requires ADMIN role.' })
  @ApiParam({ name: 'id', type: Number, description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'The role.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  findOne(@Param('id') id: string) { return this.service.findOne(+id); }

  @Post()
  @ApiOperation({ summary: 'Create a role', description: 'Creates a new role. Requires ADMIN role.' })
  @ApiResponse({ status: 201, description: 'Role created.' })
  create(@Body() body: any) { return this.service.create(body); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a role', description: 'Updates an existing role by ID. Requires ADMIN role.' })
  @ApiParam({ name: 'id', type: Number, description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role updated.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(+id, body); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role', description: 'Deletes a role by ID. Requires ADMIN role.' })
  @ApiParam({ name: 'id', type: Number, description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role deleted.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  remove(@Param('id') id: string) { return this.service.remove(+id); }
}
