import { Module } from '@nestjs/common';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsEntity } from '../posts/entities/base-posts.entity';
import { LikeEntity } from './entities/likes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostsEntity, LikeEntity])],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
