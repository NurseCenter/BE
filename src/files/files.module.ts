import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesEntity } from './entities/files.entity';
import { FilesDAO } from './files.dao';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FilesEntity])],
  controllers: [FilesController],
  providers: [FilesService, FilesDAO],
  exports: [FilesService, FilesDAO],
})
export class FilesModule {}
