import { Module } from '@nestjs/common';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsEntity } from '../posts/entities/base-posts.entity';
import { LikesEntity } from './entities/likes.entity';
import { LikesDAO } from './likes.dao';
import { DataAccessModule } from 'src/common/data-access.module';
import { PostsDAO } from 'src/posts/posts.dao';
import { PostsMetricsService } from 'src/posts/metrics/posts-metrics.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostsEntity, LikesEntity]), DataAccessModule],
  controllers: [LikesController],
  providers: [LikesService, LikesDAO, PostsDAO, PostsMetricsService],
})
export class LikesModule {}
