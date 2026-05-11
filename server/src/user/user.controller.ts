import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  @ApiOperation({ summary: 'List all users', description: 'Returns all users with their roles. Requires ADMIN role.' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by role name (e.g. STUDENT, ADMIN)' })
  @ApiResponse({ status: 200, description: 'List of users.' })
  findAll(@Query('role') role?: string) {
    if (role) return this.service.findByRole(role);
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID', description: 'Returns a single user with roles. Requires ADMIN role.' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'The user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id') id: string) { return this.service.findOne(+id); }

  @Post()
  @ApiOperation({ summary: 'Create a user', description: 'Creates a new user. Requires ADMIN role.' })
  @ApiResponse({ status: 201, description: 'User created.' })
  create(@Body() body: any) { return this.service.create(body); }

  @Patch(':id/disable')
  @ApiOperation({ summary: 'Toggle user disabled status', description: 'Enables or disables a user. Disabled users cannot log in. Requires ADMIN role.' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Disabled status toggled.' })
  toggleDisabled(@Param('id') id: string) { return this.service.toggleDisabled(+id); }

  @Patch(':id/change-password')
  @ApiOperation({ summary: 'Change user password', description: 'Changes password for a user. An email is sent with the new password. Requires ADMIN role.' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Password changed.' })
  changePassword(@Param('id') id: string, @Body() body: { password: string }) {
    return this.service.changePassword(+id, body.password);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user', description: 'Deletes a user by ID. Requires ADMIN role.' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id') id: string) { return this.service.remove(+id); }
}
