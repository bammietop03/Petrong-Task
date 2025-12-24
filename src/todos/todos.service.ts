import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto, UpdateTodoDto } from './dto/todo.dto';
import { Prisma, ReactionType } from '@prisma/client';

interface TodoWithRelations {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  reactions?: Array<{
    id: string;
    type: ReactionType;
    todoId: string;
    userId: string;
    createdAt: Date;
  }>;
  comments?: Array<{
    id: string;
    content: string;
    todoId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    user?: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
    };
  }>;
  shares?: Array<{
    id: string;
    todoId: string;
    userId: string;
    createdAt: Date;
  }>;
  [key: string]: unknown;
}

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTodoDto: CreateTodoDto) {
    return this.prisma.todo.create({
      data: {
        ...createTodoDto,
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

  async findAll(userId: string) {
    const todos = await this.prisma.todo.findMany({
      where: { userId },
      include: {
        reactions: true,
        comments: {
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
        },
        shares: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return todos.map((todo) => this.aggregateTodoStats(todo));
  }

  async findOne(id: string, userId: string) {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        reactions: {
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
        },
        comments: {
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
        },
        shares: {
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
        },
      },
    });

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    if (todo.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this todo',
      );
    }

    return this.aggregateTodoStats(todo);
  }

  async update(id: string, userId: string, updateTodoDto: UpdateTodoDto) {
    const todo = await this.prisma.todo.findUnique({ where: { id } });

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    if (todo.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this todo',
      );
    }

    const updatedTodo = await this.prisma.todo.update({
      where: { id },
      data: updateTodoDto,
      include: {
        reactions: true,
        comments: true,
        shares: true,
      },
    });

    return this.aggregateTodoStats(updatedTodo);
  }

  async remove(id: string, userId: string) {
    const todo = await this.prisma.todo.findUnique({ where: { id } });

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    if (todo.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this todo',
      );
    }

    await this.prisma.todo.delete({ where: { id } });

    return { message: 'Todo deleted successfully' };
  }

  private aggregateTodoStats(todo: TodoWithRelations) {
    const reactionCounts = {
      likes: todo.reactions?.filter((r) => r.type === 'LIKE').length || 0,
      laughs: todo.reactions?.filter((r) => r.type === 'LAUGH').length || 0,
      dislikes: todo.reactions?.filter((r) => r.type === 'DISLIKE').length || 0,
      claps: todo.reactions?.filter((r) => r.type === 'CLAP').length || 0,
    };

    return {
      ...todo,
      reactionCounts,
      totalReactions: Object.values(reactionCounts).reduce((a, b) => a + b, 0),
      commentsCount: todo.comments?.length || 0,
      sharesCount: todo.shares?.length || 0,
    };
  }
}
