import { Module } from '@nestjs/common';
import { ReportCommentsEntity, ReportPostsEntity } from './entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataAccessModule } from 'src/common/data-access.module';
import { ReportsService } from './reports.service';
import { ReportedPostsDAO, ReportedCommentsDAO, ReportedRepliesDAO } from './dao';
import { ReportsController } from './reports.controller';
import { ReportRepliesEntity } from './entities/report-replies.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReportCommentsEntity, ReportRepliesEntity, ReportPostsEntity]), DataAccessModule],
  controllers: [ReportsController],
  providers: [ReportsService, ReportedPostsDAO, ReportedCommentsDAO, ReportedRepliesDAO],
  exports: [ReportsService, ReportedPostsDAO, ReportedCommentsDAO, ReportedRepliesDAO],
})
export class ReportsModule {}
