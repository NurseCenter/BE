import { Module } from '@nestjs/common';
import { ScrapController } from './scraps.controller';
import { ScrapService } from './scraps.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsEntity } from '../posts/entities/base-posts.entity';
import { ScrapsEntity } from './entities/scraps.entity';
import { ScrapsDAO } from './scraps.dao';
import { DataAccessModule } from 'src/common/data-access.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostsEntity, ScrapsEntity]), DataAccessModule],
  controllers: [ScrapController],
  providers: [ScrapService, ScrapsDAO],
  exports: [ScrapService],
})
export class ScrapModule {}
