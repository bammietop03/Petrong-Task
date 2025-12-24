import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { ReactionType } from '@prisma/client';

@Injectable()
export class ReactionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createReactionDto: CreateReactionDto) {
    const { type, todoId } = createReactionDto;

    // Check if todo exists
    const todo = await this.prisma.todo.findUnique({ where: { id: todoId } });
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    // Check if user already reacted with this type
    const existingReaction = await this.prisma.reaction.findUnique({
      where: {
        todoId_userId_type: {
          todoId,
          userId,
          type,
        },
      },
    });

    if (existingReaction) {
      throw new ConflictException('You have already reacted with this type');
    }

    return this.prisma.reaction.create({
      data: {
        type,
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

  async findAllByTodo(todoId: string) {
    const reactions = await this.prisma.reaction.findMany({
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
    });

    // Aggregate by type
    const counts = {
      LIKE: reactions.filter((r) => r.type === 'LIKE').length,
      LAUGH: reactions.filter((r) => r.type === 'LAUGH').length,
      DISLIKE: reactions.filter((r) => r.type === 'DISLIKE').length,
      CLAP: reactions.filter((r) => r.type === 'CLAP').length,
    };

    return {
      reactions,
      counts,
      total: reactions.length,
    };
  }

  async remove(id: string, userId: string) {
    const reaction = await this.prisma.reaction.findUnique({
      where: { id },
    });

    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }

    if (reaction.userId !== userId) {
      throw new ForbiddenException('You can only remove your own reactions');
    }

    await this.prisma.reaction.delete({ where: { id } });

    return { message: 'Reaction removed successfully' };
  }

  async removeByTypeAndTodo(userId: string, todoId: string, type: string) {
    const reaction = await this.prisma.reaction.findUnique({
      where: {
        todoId_userId_type: {
          todoId,
          userId,
          type: type as ReactionType,
        },
      },
    });

    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }

    await this.prisma.reaction.delete({ where: { id: reaction.id } });

    return { message: 'Reaction removed successfully' };
  }
}
