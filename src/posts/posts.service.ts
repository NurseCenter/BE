import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmploymentEntity } from './entities/employment.entity';
import {
  BaseEntity,
  EntitySchema,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { EventEntity } from './entities/event.entity';
import { ExamPrepEntity } from './entities/exam-prep.entity';
import { JobEntity } from './entities/job.entity';
import { NoticeEntity } from './entities/notice.entity';
import { PracticeEntity } from './entities/practice.entity';
import { TheoryEntity } from './entities/theory.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { BasePostsEntity } from './entities/base-posts.entity';
import { create } from 'domain';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetPostsQueryDto } from './dto/get-post-query.dto';
import { BoardType } from './enum/boardType.enum';

@Injectable()
export class PostsService {
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
    ]);
  }

  //postType에 맞는 Repository 반환
  private getRepository(postType: BoardType): Repository<BasePostsEntity> {
    const repository = this.repositoryMap.get(postType);

    if (!repository) {
      throw new BadRequestException('존재 하지 않는 게시판 형식입니다.');
    }
    return repository;
  }
  //데이터베이스 에러 헨들링
  private handleDatabaseError(err: unknown): never {
    if (err instanceof QueryFailedError) {
      const errorCode = (err as any).code;
      switch (errorCode) {
        case '23503':
          throw new BadRequestException('잘못된 참조 데이터입니다.');
        case '23502':
          throw new BadRequestException('필수 필드가 누락되었습니다.');
        default:
          console.error('데이터베이스 에러:', err.message);
          throw new InternalServerErrorException(
            '데이터베이스 오류가 발생했습니다.',
          );
      }
    } else if (err instanceof Error) {
      console.error('예기치 못한 오류 발생', err.message);
      throw new InternalServerErrorException(
        '예기치 못한 오류가 발생했습니다.',
      );
    } else {
      console.error('알 수 없는 오류 발생', err);
      throw new InternalServerErrorException('알 수 없는 오류가 발생했습니다.');
    }
  }

  //게시글 조회
  //쿼리값이 하나도 없을 경우 전체조회, 쿼리값이 있을 경우 조건에 맞는 조회
  async getPosts(
    boardType: BoardType,
    sortType: SortType,
    getPostsQueryDto: GetPostsQueryDto,
  ) {
    const { page, limit, search } = getPostsQueryDto;
    let repository = this.getRepository(boardType);
    let query = repository.createQueryBuilder('post');

    if (search) {
      query = query.where(
        'post.title LIKE :search OR post.content LIKE :search',
        { search: `%${search}%` },
      );
    }

    // 칼럼 기준 조회

    // 정렬 적용

    // 페이지네이션 적용
    query = query.skip((page - 1) * limit).take(limit);

    const [posts, total] = await query.getManyAndCount();

    return {
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  //게시글 생성
  async createPost(
    boardType: BoardType,
    createpostDto: CreatePostDto,
  ): Promise<BasePostsEntity> {
    const { title, content } = createpostDto;
    let repository = this.getRepository(boardType);

    try {
      const createdPost = repository.create({ title, content, userId: 1 });

      const savedPost = await repository.save(createdPost);

      return savedPost;
    } catch (err) {
      this.handleDatabaseError(err);
    }
  }
  //특정 게시글 조회
  //특정 게시글 신고
  //게시글 수정
  async updatePost(
    postId: number,
    userId: number,
    boardType: BoardType,
    updatePostDto: UpdatePostDto,
  ) {
    let repository = this.getRepository(boardType);
    try {
      const post = await repository.findOneBy({ postId });
      if (!post)
        throw new NotFoundException(
          `${boardType} 게시판에서 ${postId}번 게시물을 찾을 수 없습니다.`,
        );

      if (post.userId !== userId) {
        throw new ForbiddenException('이 게시물을 수정할 권한이 없습니다.');
      }
      const updatePostFields = Object.entries(updatePostDto).reduce(
        (acc, [key, value]) => {
          if (value !== null && value !== undefined) {
            acc[key] = value;
          }
          return acc;
        },
        {},
      );

      Object.assign(post, updatePostFields);

      const updatedPost = await repository.save(post);
      return updatedPost;
    } catch (err) {
      this.handleDatabaseError(err);
    }
  }

  //게시글 삭제
}
