import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsEntity } from '../comments/entities/comments.entity';
import { PostsEntity } from './entities/base-posts.entity';
import { ReportPostsEntity } from 'src/reports/entities';
import { ScrapsEntity } from '../scraps/entities/scraps.entity';
import { PostsMetricsService } from './metrics/posts-metrics.service';
import { LikesEntity } from 'src/likes/entities/likes.entity';
import { PostsDAO } from './posts.dao';
import { DataAccessModule } from 'src/common/data-access.module';
import { PostsMetricsDAO } from './metrics/posts-metrics-dao';
import { FilesEntity } from 'src/files/entities/files.entity';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentsEntity, PostsEntity, ReportPostsEntity, FilesEntity, ScrapsEntity, LikesEntity]),
    FilesModule,
    DataAccessModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsMetricsService, PostsDAO, PostsMetricsDAO],
  exports: [PostsDAO, PostsMetricsService, PostsService],
})
export class PostsModule {}
