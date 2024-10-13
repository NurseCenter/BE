import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesEntity } from './entities/files.entity';
import { FilesDAO } from './files.dao';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { DataAccessModule } from 'src/common/data-access.module';

@Module({
  imports: [TypeOrmModule.forFeature([FilesEntity]), DataAccessModule],
  controllers: [FilesController],
  providers: [FilesService, FilesDAO],
  exports: [FilesService, FilesDAO],
})
export class FilesModule {}
