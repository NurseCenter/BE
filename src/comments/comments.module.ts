import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsEntity } from './entities/comments.entity';
import { RepliesEntity } from '../replies/entities/replies.entity';
import { PostsModule } from '../posts/posts.module';
import { PostsEntity } from '../posts/entities/base-posts.entity';
import { ReportCommentsEntity } from '../reports/entities/report-comments.entity';
import { ReportedCommentsDAO } from 'src/reports/dao';
import { PostsDAO } from 'src/posts/posts.dao';
import { CommentsDAO } from './comments.dao';
import { DataAccessModule } from 'src/common/data-access.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentsEntity, RepliesEntity, PostsEntity, ReportCommentsEntity]),
    PostsModule,
    DataAccessModule,
  ],
  providers: [CommentsService, CommentsDAO, ReportedCommentsDAO, PostsDAO],
  controllers: [CommentsController],
  exports: [CommentsDAO],
})
export class CommentsModule {}
