import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from './entities/event.entity';
import { EmploymentEntity } from './entities/employment.entity';
import { ExamPrepEntity } from './entities/exam-prep.entity';
import { JobEntity } from './entities/job.entity';
import { NoticeEntity } from './entities/notice.entity';
import { PracticeEntity } from './entities/practice.entity';
import { TheoryEntity } from './entities/theory.entity';

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
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
