import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersEntity } from 'src/users/entities/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataAccessModule } from 'src/common/data-access.module';
import { DeletedUsersEntity, RejectedUsersEntity, SuspendedUsersEntity } from './entities';
import { AuthModule } from 'src/auth/auth.module';
import { CommentsEntity } from 'src/comments/entities/comments.entity';
import { RepliesEntity } from 'src/replies/entities/replies.entity';
import { PostsEntity } from 'src/posts/entities/base-posts.entity';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      DeletedUsersEntity,
      SuspendedUsersEntity,
      PostsEntity,
      CommentsEntity,
      RepliesEntity,
      RejectedUsersEntity,
    ]),
    DataAccessModule,
    AuthModule,
    EmailModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
