import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TodosService } from './todos.service';
import { CreateTodoDto, UpdateTodoDto } from './dto/todo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';

@ApiTags('todos')
@Controller('todos')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@ApiBearerAuth('JWT-auth')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new todo' })
  @ApiResponse({
    status: 201,
    description: 'Todo created successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Complete project documentation',
        description: 'Write comprehensive API documentation',
        completed: false,
        userId: '550e8400-e29b-41d4-a716-446655440001',
        createdAt: '2025-12-24T10:00:00.000Z',
        updatedAt: '2025-12-24T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Active subscription required',
  })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() createTodoDto: CreateTodoDto,
  ) {
    return this.todosService.create(user.sub, createTodoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all todos for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of todos retrieved',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Complete project documentation',
          description: 'Write comprehensive API documentation',
          completed: false,
          userId: '550e8400-e29b-41d4-a716-446655440001',
          createdAt: '2025-12-24T10:00:00.000Z',
          updatedAt: '2025-12-24T10:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Active subscription required',
  })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.todosService.findAll(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific todo by ID' })
  @ApiParam({
    name: 'id',
    description: 'Todo ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Todo retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Active subscription required',
  })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.todosService.findOne(id, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a todo' })
  @ApiParam({
    name: 'id',
    description: 'Todo ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Todo updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Active subscription required',
  })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    return this.todosService.update(id, user.sub, updateTodoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a todo' })
  @ApiParam({
    name: 'id',
    description: 'Todo ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Todo deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Active subscription required',
  })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.todosService.remove(id, user.sub);
  }
}
