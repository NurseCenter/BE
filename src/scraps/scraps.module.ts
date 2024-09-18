import { Module } from '@nestjs/common';
import { ScrapController } from './scraps.controller';
import { ScrapService } from './scraps.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsEntity } from '../posts/entities/base-posts.entity';
import { ScrapsEntity } from './entities/scraps.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostsEntity, ScrapsEntity])],
  controllers: [ScrapController],
  providers: [ScrapService],
  exports: [ScrapService],
})
export class ScrapModule {}
