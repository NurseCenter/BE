import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsEntity } from '../comments/entities/comments.entity';
import { CommentsModule } from '../comments/comments.module';
import { PostsEntity } from './entities/base-posts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommentsEntity, PostsEntity])],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsModule],
})
export class PostsModule {}
