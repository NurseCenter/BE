import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesEntity } from './entities/files.entity';
import { FilesDAO } from './dao/files.dao';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { DataAccessModule } from 'src/common/data-access.module';
import { ImagesEntity } from './entities/images.entity';
import { ImagesDAO } from './dao/images.dao';

@Module({
  imports: [TypeOrmModule.forFeature([FilesEntity, ImagesEntity]), DataAccessModule],
  controllers: [FilesController],
  providers: [FilesService, FilesDAO, ImagesDAO],
  exports: [FilesService, FilesDAO, ImagesDAO],
})
export class FilesModule {}
