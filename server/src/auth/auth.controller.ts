import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Get('ping')
  @ApiOperation({ summary: 'Health check', description: 'Returns OK if the auth service is reachable.' })
  @ApiResponse({ status: 200, description: 'Service is alive.' })
  ping() {
    return { ok: true, hasService: !!this.service };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user', description: 'Creates a new user account with the STUDENT role.' })
  @ApiBody({ schema: { example: { email: 'user@example.com', password: 'pass123', name: 'John Doe' } } })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  register(@Body() body: { email: string; password: string; name: string }) {
    return this.service.register(body.email, body.password, body.name);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login', description: 'Authenticates a user and returns a JWT access token.' })
  @ApiBody({ schema: { example: { email: 'admin@dsasheet.com', password: 'admin123' } } })
  @ApiResponse({ status: 200, description: 'Login successful, returns token + user info.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  login(@Body() body: { email: string; password: string }) {
    return this.service.login(body.email, body.password);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post('admin/create-user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin create user', description: 'Creates a user with a specified role (default: STUDENT). Requires ADMIN role.' })
  @ApiBody({ schema: { example: { email: 'student@test.com', password: 'pass123', name: 'Jane Doe', role: 'STUDENT' } } })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  adminCreateUser(@Body() body: { email: string; password: string; name: string; role?: string }) {
    return this.service.adminCreateUser(body.email, body.password, body.name, body.role);
  }
}
