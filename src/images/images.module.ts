import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesDAO } from './images.dao';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesEntity } from './entities/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ImagesEntity])],
  providers: [ImagesService, ImagesDAO],
  exports: [ImagesService],
})
export class ImagesModule {}
