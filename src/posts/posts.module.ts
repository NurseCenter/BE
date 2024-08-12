import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { SController } from './s/s.controller';
import { PostsService } from './posts.service';

@Module({
  controllers: [PostsController, SController],
  providers: [PostsService]
})
export class PostsModule {}
