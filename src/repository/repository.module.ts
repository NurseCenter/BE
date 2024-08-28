import { Module } from '@nestjs/common';
import { RepositoryService } from './repository.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from '../posts/entities/event.entity';
import { EmploymentEntity } from '../posts/entities/employment.entity';
import { ExamPrepEntity } from '../posts/entities/exam-prep.entity';
import { JobEntity } from '../posts/entities/job.entity';
import { NoticeEntity } from '../posts/entities/notice.entity';
import { PracticeEntity } from '../posts/entities/practice.entity';
import { TheoryEntity } from '../posts/entities/theory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventEntity,
      EmploymentEntity,
      ExamPrepEntity,
      JobEntity,
      NoticeEntity,
      PracticeEntity,
      TheoryEntity,
    ]),
  ],
  providers: [RepositoryService],
  exports: [RepositoryService],
})
export class RepositoryModule {}
