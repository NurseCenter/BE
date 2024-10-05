import { Module } from '@nestjs/common';
import { RepliesService } from './replies.service';
import { RepliesController } from './replies.controller';
import { RepliesEntity } from './entities/replies.entity';
import { CommentsEntity } from '../comments/entities/comments.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepliesDAO } from './replies.dao';
import { CommentsModule } from 'src/comments/comments.module';
import { ReportsModule } from 'src/reports/reports.module';
import { DataAccessModule } from 'src/common/data-access.module';

@Module({
  imports: [TypeOrmModule.forFeature([CommentsEntity, RepliesEntity]), CommentsModule, ReportsModule, DataAccessModule],
  controllers: [RepliesController],
  providers: [RepliesService, RepliesDAO],
})
export class RepliesModule {}
