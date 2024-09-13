import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { UsersService } from './users.service';
import { ScrapModule } from 'src/scraps/scraps.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsEntity } from 'src/comments/entities/comments.entity';
import { PostsEntity } from 'src/posts/entities/base-posts.entity';
import { RepliesEntity } from 'src/replies/entities/replies.entity';
import { UsersEntity } from './entities/users.entity';
import { ScrapsEntity } from 'src/scraps/entities/scraps.entity';
import { AuthModule } from 'src/auth/auth.module';
import { DataAccessModule } from '../common/data-access.module';
import { OcrModule } from 'src/orc/ocr.module';
import { UsersDAO } from './users.dao';
import { UsersController } from './users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersEntity, PostsEntity, CommentsEntity, RepliesEntity, ScrapsEntity]),
    ScrapModule,
    AuthModule,
    DataAccessModule,
    OcrModule,
  ],
  controllers: [UsersController, MeController],
  providers: [UsersService, UsersDAO],
  exports: [UsersDAO],
})
export class UsersModule {}
