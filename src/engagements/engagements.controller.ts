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
import { EngagementsService } from './engagements.service';
import {
  CreateCommentDto,
  UpdateCommentDto,
  CreateShareDto,
} from './dto/engagement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';

@ApiTags('engagements')
@Controller('engagements')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@ApiBearerAuth('JWT-auth')
export class EngagementsController {
  constructor(private readonly engagementsService: EngagementsService) {}

  // Comments
  @Post('comments')
  @ApiOperation({ summary: 'Add a comment to a todo' })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        content: 'This is a great todo!',
        todoId: '550e8400-e29b-41d4-a716-446655440001',
        userId: '550e8400-e29b-41d4-a716-446655440002',
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
  createComment(
    @CurrentUser() user: JwtPayload,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.engagementsService.createComment(user.sub, createCommentDto);
  }

  @Get('comments/todo/:todoId')
  @ApiOperation({ summary: 'Get all comments for a specific todo' })
  @ApiParam({
    name: 'todoId',
    description: 'Todo ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          content: 'This is a great todo!',
          todoId: '550e8400-e29b-41d4-a716-446655440001',
          userId: '550e8400-e29b-41d4-a716-446655440002',
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
  findCommentsByTodo(@Param('todoId') todoId: string) {
    return this.engagementsService.findCommentsByTodo(todoId);
  }

  @Patch('comments/:id')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiParam({
    name: 'id',
    description: 'Comment ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Active subscription required',
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  updateComment(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.engagementsService.updateComment(
      id,
      user.sub,
      updateCommentDto,
    );
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({
    name: 'id',
    description: 'Comment ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Active subscription required',
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  deleteComment(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.engagementsService.deleteComment(id, user.sub);
  }

  // Shares
  @Post('shares')
  @ApiOperation({ summary: 'Share a todo' })
  @ApiResponse({
    status: 201,
    description: 'Todo shared successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
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
  createShare(
    @CurrentUser() user: JwtPayload,
    @Body() createShareDto: CreateShareDto,
  ) {
    return this.engagementsService.createShare(user.sub, createShareDto);
  }

  @Get('shares/todo/:todoId')
  @ApiOperation({ summary: 'Get all shares for a specific todo' })
  @ApiParam({
    name: 'todoId',
    description: 'Todo ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Shares retrieved successfully',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
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
  findSharesByTodo(@Param('todoId') todoId: string) {
    return this.engagementsService.findSharesByTodo(todoId);
  }

  @Delete('shares/:id')
  @ApiOperation({ summary: 'Delete a share' })
  @ApiParam({
    name: 'id',
    description: 'Share ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Share deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Active subscription required',
  })
  @ApiResponse({ status: 404, description: 'Share not found' })
  deleteShare(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.engagementsService.deleteShare(id, user.sub);
  }
}
