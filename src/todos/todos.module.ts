import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, ConfigModule],
  controllers: [TodosController],
  providers: [TodosService],
  exports: [TodosService],
})
export class TodosModule {}
