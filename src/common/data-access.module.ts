import { Module } from '@nestjs/common';
import { UsersDAO } from '../users/users.dao';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../users/entities/users.entity';
import { CommentsDAO } from 'src/comments/comments.dao';
import { PostsDAO } from 'src/posts/posts.dao';
import { CommentsEntity } from 'src/comments/entities/comments.entity';
import { PostsEntity } from 'src/posts/entities/base-posts.entity';
import { RepliesEntity } from 'src/replies/entities/replies.entity';
import { RepliesDAO } from 'src/replies/replies.dao';
import { DeletedUsersDAO, SuspendedUsersDAO } from 'src/admin/dao';
import { DeletedUsersEntity, SuspendedUsersEntity } from 'src/admin/entities';
import { ScrapsDAO } from 'src/scraps/scraps.dao';
import { ScrapsEntity } from 'src/scraps/entities/scraps.entity';
import { LikesDAO } from 'src/likes/likes.dao';
import { LikesEntity } from 'src/likes/entities/likes.entity';
import { ReportCommentsEntity, ReportPostsEntity } from 'src/reports/entities';
import { ReportsDAO } from 'src/reports/reports.dao';
import { PostsMetricsDAO } from 'src/posts/metrics/posts-metrics-dao';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      CommentsEntity,
      PostsEntity,
      RepliesEntity,
      DeletedUsersEntity,
      SuspendedUsersEntity,
      ScrapsEntity,
      LikesEntity,
      ReportPostsEntity,
      ReportCommentsEntity,
    ]),
  ],
  providers: [
    UsersDAO,
    CommentsDAO,
    PostsDAO,
    PostsMetricsDAO,
    RepliesDAO,
    DeletedUsersDAO,
    SuspendedUsersDAO,
    ScrapsDAO,
    LikesDAO,
    ReportsDAO,
  ],
  exports: [
    UsersDAO,
    CommentsDAO,
    PostsDAO,
    PostsMetricsDAO,
    RepliesDAO,
    DeletedUsersDAO,
    SuspendedUsersDAO,
    ScrapsDAO,
    LikesDAO,
    ReportsDAO,
  ],
})
export class DataAccessModule {}
