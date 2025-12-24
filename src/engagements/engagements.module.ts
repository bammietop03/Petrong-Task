import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EngagementsService } from './engagements.service';
import { EngagementsController } from './engagements.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, ConfigModule],
  controllers: [EngagementsController],
  providers: [EngagementsService],
  exports: [EngagementsService],
})
export class EngagementsModule {}
