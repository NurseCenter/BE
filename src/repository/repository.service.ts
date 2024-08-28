import { BadRequestException, Injectable } from '@nestjs/common';
import { BasePostsEntity } from '../posts/entities/base-posts.entity';
import { Repository } from 'typeorm';
import { BoardType } from '../posts/enum/boardType.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { EmploymentEntity } from '../posts/entities/employment.entity';
import { EventEntity } from '../posts/entities/event.entity';
import { ExamPrepEntity } from '../posts/entities/exam-prep.entity';
import { JobEntity } from '../posts/entities/job.entity';
import { NoticeEntity } from '../posts/entities/notice.entity';
import { PracticeEntity } from '../posts/entities/practice.entity';
import { TheoryEntity } from '../posts/entities/theory.entity';

@Injectable()
export class RepositoryService {
  private repositoryMap: Map<BoardType, Repository<BasePostsEntity>>;

  constructor(
    @InjectRepository(EmploymentEntity)
    private employmentRepository: Repository<EmploymentEntity>,
    @InjectRepository(EventEntity)
    private eventRepository: Repository<EventEntity>,
    @InjectRepository(ExamPrepEntity)
    private examPrepRepository: Repository<ExamPrepEntity>,
    @InjectRepository(JobEntity)
    private jobRepository: Repository<JobEntity>,
    @InjectRepository(NoticeEntity)
    private noticeRepository: Repository<NoticeEntity>,
    @InjectRepository(PracticeEntity)
    private practiceRepository: Repository<PracticeEntity>,
    @InjectRepository(TheoryEntity)
    private theoryRepository: Repository<TheoryEntity>,
  ) {
    this.initRepositoryMap();
  }
  //현재 존재하는 Repository 맵핑
  private initRepositoryMap() {
    this.repositoryMap = new Map([
      [BoardType.EMPLOYMENT, this.employmentRepository],
      [BoardType.EVENT, this.eventRepository],
      [BoardType.EXAM, this.examPrepRepository],
      [BoardType.JOB, this.jobRepository],
      [BoardType.NOTICE, this.noticeRepository],
      [BoardType.PRACTICE, this.practiceRepository],
      [BoardType.THEORY, this.theoryRepository],
    ] as [BoardType, Repository<BasePostsEntity>][]);
  }
  public getRepository(postType: BoardType): Repository<BasePostsEntity> {
    const repository = this.repositoryMap.get(postType);

    if (!repository) {
      throw new BadRequestException('존재 하지 않는 게시판 형식입니다.');
    }
    return repository;
  }
}
