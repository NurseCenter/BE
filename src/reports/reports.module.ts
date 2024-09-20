import { Module } from '@nestjs/common';
import { ReportCommentsEntity, ReportPostsEntity } from './entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataAccessModule } from 'src/common/data-access.module';
import { ReportsController } from './reports.controller';
import { ReportsDAO } from './reports.dao';
import { ReportsService } from './reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReportCommentsEntity, ReportPostsEntity]), DataAccessModule],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsDAO],
  exports: [ReportsService],
})
export class ReportsModule {}
