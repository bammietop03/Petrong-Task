import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCommentDto,
  UpdateCommentDto,
  CreateShareDto,
} from './dto/engagement.dto';

@Injectable()
export class EngagementsService {
  constructor(private prisma: PrismaService) {}

  // Comments
  async createComment(userId: string, createCommentDto: CreateCommentDto) {
    const { content, todoId } = createCommentDto;

    const todo = await this.prisma.todo.findUnique({ where: { id: todoId } });
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    return this.prisma.comment.create({
      data: {
        content,
        todoId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findCommentsByTodo(todoId: string) {
    return this.prisma.comment.findMany({
      where: { todoId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateComment(
    id: string,
    userId: string,
    updateCommentDto: UpdateCommentDto,
  ) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    return this.prisma.comment.update({
      where: { id },
      data: { content: updateCommentDto.content },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async deleteComment(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({ where: { id } });

    return { message: 'Comment deleted successfully' };
  }

  // Shares
  async createShare(userId: string, createShareDto: CreateShareDto) {
    const { todoId } = createShareDto;

    const todo = await this.prisma.todo.findUnique({ where: { id: todoId } });
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    // Check if user already shared this todo
    const existingShare = await this.prisma.share.findUnique({
      where: {
        todoId_userId: {
          todoId,
          userId,
        },
      },
    });

    if (existingShare) {
      throw new ConflictException('You have already shared this todo');
    }

    return this.prisma.share.create({
      data: {
        todoId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findSharesByTodo(todoId: string) {
    const shares = await this.prisma.share.findMany({
      where: { todoId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      shares,
      count: shares.length,
    };
  }

  async deleteShare(id: string, userId: string) {
    const share = await this.prisma.share.findUnique({ where: { id } });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    if (share.userId !== userId) {
      throw new ForbiddenException('You can only remove your own shares');
    }

    await this.prisma.share.delete({ where: { id } });

    return { message: 'Share removed successfully' };
  }
}
