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

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity, CommentsEntity, PostsEntity, RepliesEntity, DeletedUsersEntity, SuspendedUsersEntity])],
  providers: [UsersDAO, CommentsDAO, PostsDAO, RepliesDAO, DeletedUsersDAO, SuspendedUsersDAO],
  exports: [UsersDAO, CommentsDAO, PostsDAO, RepliesDAO, DeletedUsersDAO, SuspendedUsersDAO],
})
export class DataAccessModule {}
