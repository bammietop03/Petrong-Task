import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtPayload } from './types/jwt-payload.type';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: '2025-12-24T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: '2025-12-24T10:00:00.000Z',
        subscription: {
          isActive: true,
          expiresAt: '2025-01-24T10:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.authService.validateUser(user.sub);
  }
}
