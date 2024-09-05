import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsEntity } from '../comments/entities/comments.entity';
import { PostsEntity } from './entities/base-posts.entity';
import { ReportPostsEntity } from '../admin/entities/report-posts.entity';
import { ImageEntity } from '../images/entities/image.entity';
import { ImagesModule } from '../images/images.module';

@Module({
  imports: [TypeOrmModule.forFeature([CommentsEntity, PostsEntity, ReportPostsEntity, ImageEntity]), ImagesModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsModule],
})
export class PostsModule {}
