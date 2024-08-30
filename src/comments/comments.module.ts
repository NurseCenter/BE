import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsEntity } from './entities/comments.entity';
import { RepliesEntity } from '../replies/entities/replies.entity';
import { PostsModule } from '../posts/posts.module';
import { PostsEntity } from '../posts/entities/base-posts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommentsEntity, RepliesEntity, PostsEntity]), PostsModule],
  providers: [CommentsService],
  controllers: [CommentsController],
  exports: [CommentsModule],
})
export class CommentsModule {}
