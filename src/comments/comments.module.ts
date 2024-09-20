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

@Module({
  imports: [TypeOrmModule.forFeature([CommentsEntity, RepliesEntity, PostsEntity, ReportCommentsEntity]), PostsModule],
  providers: [CommentsService, CommentsDAO, ReportedCommentsDAO, PostsDAO],
  controllers: [CommentsController],
  exports: [CommentsModule],
})
export class CommentsModule {}
