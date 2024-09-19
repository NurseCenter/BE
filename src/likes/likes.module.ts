import { Module } from '@nestjs/common';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsEntity } from '../posts/entities/base-posts.entity';
import { LikesEntity } from './entities/likes.entity';
import { LikesDAO } from './likes.dao';

@Module({
  imports: [TypeOrmModule.forFeature([PostsEntity, LikesEntity])],
  controllers: [LikesController],
  providers: [LikesService, LikesDAO],
})
export class LikesModule {}
