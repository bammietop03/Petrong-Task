import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TodosModule } from './todos/todos.module';
import { ReactionsModule } from './reactions/reactions.module';
import { EngagementsModule } from './engagements/engagements.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    SubscriptionsModule,
    TodosModule,
    ReactionsModule,
    EngagementsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
