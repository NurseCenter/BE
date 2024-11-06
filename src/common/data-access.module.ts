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
import { DeletedUsersEntity, RejectedUsersEntity, SuspendedUsersEntity } from 'src/admin/entities';
import { ScrapsDAO } from 'src/scraps/scraps.dao';
import { ScrapsEntity } from 'src/scraps/entities/scraps.entity';
import { LikesDAO } from 'src/likes/likes.dao';
import { LikesEntity } from 'src/likes/entities/likes.entity';
import { ReportCommentsEntity, ReportPostsEntity } from 'src/reports/entities';
import { PostsMetricsDAO } from 'src/posts/metrics/posts-metrics-dao';
import { ReportedCommentsDAO, ReportedPostsDAO } from 'src/reports/dao';
import { RejectedUsersDAO } from 'src/admin/dao/rejected-users.dao';
import { DeletedUsersDAO } from 'src/admin/dao/delete-users.dao';
import { SuspendedUsersDAO } from 'src/admin/dao/suspended-users.dao';
import { FilesDAO } from 'src/files/dao/files.dao';
import { FilesEntity } from 'src/files/entities/files.entity';
import { ImagesDAO } from 'src/files/dao/images.dao';
import { ImagesEntity } from 'src/files/entities/images.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      CommentsEntity,
      PostsEntity,
      RepliesEntity,
      DeletedUsersEntity,
      SuspendedUsersEntity,
      RejectedUsersEntity,
      ScrapsEntity,
      LikesEntity,
      ReportPostsEntity,
      ReportCommentsEntity,
      FilesEntity,
      ImagesEntity,
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
    RejectedUsersDAO,
    ScrapsDAO,
    LikesDAO,
    ReportedPostsDAO,
    ReportedCommentsDAO,
    FilesDAO,
    ImagesDAO,
  ],
  exports: [
    UsersDAO,
    CommentsDAO,
    PostsDAO,
    PostsMetricsDAO,
    RepliesDAO,
    DeletedUsersDAO,
    SuspendedUsersDAO,
    RejectedUsersDAO,
    ScrapsDAO,
    LikesDAO,
    ReportedPostsDAO,
    ReportedCommentsDAO,
  ],
})
export class DataAccessModule {}
