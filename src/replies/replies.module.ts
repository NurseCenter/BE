import { Module } from '@nestjs/common';
import { RepliesService } from './replies.service';
import { RepliesController } from './replies.controller';
import { RepliesEntity } from './entities/replies.entity';
import { CommentsEntity } from '../comments/entities/comments.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CommentsEntity, RepliesEntity])],
  controllers: [RepliesController],
  providers: [RepliesService],
})
export class RepliesModule {}
