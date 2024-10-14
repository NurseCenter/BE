import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { CommentsEntity } from 'src/comments/entities/comments.entity';
import { DataAccessModule } from 'src/common/data-access.module';
import { FilesEntity } from 'src/files/entities/files.entity';
import { FilesModule } from 'src/files/files.module';
import { LikesEntity } from 'src/likes/entities/likes.entity';
import { PostsEntity } from 'src/posts/entities/base-posts.entity';
import { ScrapsEntity } from 'src/scraps/entities/scraps.entity';
import { TestGuardsController } from './test-guards.controller';
import { TestPostsService } from './test-posts.service';
import { TestPostsController } from './test-posts.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentsEntity, PostsEntity, FilesEntity, ScrapsEntity, LikesEntity]),
    FilesModule,
    DataAccessModule,
  ],
  controllers: [TestPostsController, TestGuardsController],
  providers: [TestPostsService],
})
export class TestControllerModule {}
