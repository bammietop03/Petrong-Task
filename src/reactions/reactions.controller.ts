import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ReactionsService } from './reactions.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';

@ApiTags('reactions')
@Controller('reactions')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@ApiBearerAuth('JWT-auth')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a reaction to a todo' })
  @ApiResponse({
    status: 201,
    description: 'Reaction created successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'LIKE',
        todoId: '550e8400-e29b-41d4-a716-446655440001',
        userId: '550e8400-e29b-41d4-a716-446655440002',
        createdAt: '2025-12-24T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Active subscription required',
  })
  @ApiResponse({ status: 400, description: 'Invalid reaction type or todo' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() createReactionDto: CreateReactionDto,
  ) {
    return this.reactionsService.create(user.sub, createReactionDto);
  }

  @Get('todo/:todoId')
  @ApiOperation({ summary: 'Get all reactions for a specific todo' })
  @ApiParam({
    name: 'todoId',
    description: 'Todo ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Reactions retrieved successfully',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          type: 'LIKE',
          todoId: '550e8400-e29b-41d4-a716-446655440001',
          userId: '550e8400-e29b-41d4-a716-446655440002',
          createdAt: '2025-12-24T10:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Active subscription required',
  })
  findAllByTodo(@Param('todoId') todoId: string) {
    return this.reactionsService.findAllByTodo(todoId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a reaction by ID' })
  @ApiParam({
    name: 'id',
    description: 'Reaction ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Reaction deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Active subscription required',
  })
  @ApiResponse({ status: 404, description: 'Reaction not found' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.reactionsService.remove(id, user.sub);
  }

  @Delete('todo/:todoId/type/:type')
  @ApiOperation({
    summary: 'Delete a specific reaction type from a todo by current user',
  })
  @ApiParam({
    name: 'todoId',
    description: 'Todo ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'type',
    description: 'Reaction type',
    example: 'LIKE',
    enum: ['LIKE', 'LAUGH', 'DISLIKE', 'CLAP'],
  })
  @ApiResponse({ status: 200, description: 'Reaction deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Active subscription required',
  })
  @ApiResponse({ status: 404, description: 'Reaction not found' })
  removeByType(
    @Param('todoId') todoId: string,
    @Param('type') type: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.reactionsService.removeByTypeAndTodo(user.sub, todoId, type);
  }
}
