import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesDAO } from './images.dao';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesEntity } from './entities/image.entity';
import { ImagesController } from './images.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ImagesEntity])],
  controllers: [ImagesController],
  providers: [ImagesService, ImagesDAO],
  exports: [ImagesService],
})
export class ImagesModule {}
