import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ReactionsService } from './reactions.service';
import { ReactionsController } from './reactions.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, ConfigModule],
  controllers: [ReactionsController],
  providers: [ReactionsService],
  exports: [ReactionsService],
})
export class ReactionsModule {}
