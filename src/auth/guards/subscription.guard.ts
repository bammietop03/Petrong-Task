import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { isSubscribed: true, subscriptionEndDate: true },
    });

    if (!dbUser) {
      throw new ForbiddenException('User not found');
    }

    if (
      !dbUser.isSubscribed ||
      (dbUser.subscriptionEndDate && new Date() > dbUser.subscriptionEndDate)
    ) {
      throw new ForbiddenException('Active subscription required');
    }

    return true;
  }
}
