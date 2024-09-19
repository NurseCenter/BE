import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsEntity } from '../comments/entities/comments.entity';
import { PostsEntity } from './entities/base-posts.entity';
import { ImagesModule } from '../images/images.module';
import { ReportPostsEntity } from 'src/reports/entities';
import { ScrapsEntity } from '../scraps/entities/scraps.entity';
import { PostsMetricsService } from './metrics/posts-metrics.service';
import { LikesEntity } from 'src/likes/entities/likes.entity';
import { ImagesEntity } from 'src/images/entities/image.entity';
import { PostsDAO } from './posts.dao';
import { DataAccessModule } from 'src/common/data-access.module';
import { FileUploader } from './file-uploader';
import { PostsMetricsDAO } from './metrics/posts-metrics-dao';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentsEntity, PostsEntity, ReportPostsEntity, ImagesEntity, ScrapsEntity, LikesEntity]),
    ImagesModule,
    DataAccessModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsMetricsService, PostsDAO, PostsMetricsDAO, FileUploader],
  exports: [PostsModule, PostsMetricsService],
})
export class PostsModule {}
