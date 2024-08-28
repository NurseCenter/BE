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
  TypeORMError,
} from 'typeorm';
import { EventEntity } from './entities/event.entity';
import { ExamPrepEntity } from './entities/exam-prep.entity';
import { JobEntity } from './entities/job.entity';
import { NoticeEntity } from './entities/notice.entity';
import { PracticeEntity } from './entities/practice.entity';
import { TheoryEntity } from './entities/theory.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { BasePostsEntity } from './entities/base-posts.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginateQueryDto } from './dto/get-post-query.dto';
import { BoardType } from './enum/boardType.enum';
import { SortOrder, SortType } from './enum/sortType.enum';
import { DeletePostDto } from './dto/delete-post.dto';
import { RepositoryService } from '../repository/repository.service';

@Injectable()
export class PostsService {
  constructor(private repositoryService: RepositoryService) {}

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
          console.error('데이터베이스 에러:', err.message, err.stack);
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

  private isDatabaseError(err: any): boolean {
    // TypeORM 관련 오류 확인
    if (err instanceof TypeORMError) {
      return true;
    }

    // 쿼리 실패 오류 확인
    if (err instanceof QueryFailedError) {
      return true;
    }

    // 데이터베이스 연결 오류 확인 (예시)
    if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
      return true;
    }

    // 특정 데이터베이스 오류 코드 확인 (예: MySQL)
    const databaseErrorCodes = [
      'ER_DUP_ENTRY',
      'ER_NO_SUCH_TABLE',
      'ER_PARSE_ERROR',
    ];
    if (err.code && databaseErrorCodes.includes(err.code)) {
      return true;
    }

    // PostgreSQL 오류 확인 (예시)
    if (err.code && err.code.startsWith('57P')) {
      return true;
    }

    // 그 외의 경우는 데이터베이스 오류가 아님
    return false;
  }

  //게시글 조회
  //쿼리값이 하나도 없을 경우 전체조회, 쿼리값이 있을 경우 조건에 맞는 조회
  async getPosts(boardType: BoardType, paginateQueryDto: PaginateQueryDto) {
    let { page, limit, search, sortOrder, sortType } = paginateQueryDto;
    page = page && Number(page) > 0 ? Number(page) : 1;
    limit = limit && Number(limit) > 0 ? Number(limit) : 10;
    console.log(sortOrder);
    if (limit > 50) {
      throw new BadRequestException('Limit은 50을 넘어갈 수 없습니다.');
    }
    try {
      let repository = this.repositoryService.getRepository(boardType);
      let query = repository.createQueryBuilder('post');

      if (search) {
        query = query.where(
          'post.title LIKE :search OR post.content LIKE :search',
          { search: `%${search}%` },
        );
      }

      sortType = Object.values(SortType).includes(sortType)
        ? sortType
        : SortType.DATE;
      sortOrder = Object.values(SortOrder).includes(sortOrder)
        ? sortOrder
        : SortOrder.DESC;

      switch (sortType) {
        case SortType.DATE:
          query = query
            .orderBy('post.createdAt', sortOrder)
            .addOrderBy('post.postId', sortOrder); // ID로 보조 정렬
          break;
        case SortType.LIKES:
          query = query
            .orderBy('post.likes', sortOrder)
            .addOrderBy('post.createdAt', SortOrder.DESC) // 생성 날짜로 보조 정렬
            .addOrderBy('post.postId', SortOrder.DESC); // ID로 추가 보조 정렬
          break;
        default:
          query = query
            .orderBy('post.createdAt', SortOrder.DESC)
            .addOrderBy('post.postId', SortOrder.DESC);
      }

      // 페이지네이션 적용
      const skip = (page - 1) * limit;
      query = query.skip(skip).take(limit);

      const [posts, total] = await query.getManyAndCount();

      return {
        posts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (err) {
      if (this.isDatabaseError(err)) {
        this.handleDatabaseError(err);
      } else {
        throw err;
      }
    }
  }

  //게시글 생성
  async createPost(
    boardType: BoardType,
    createpostDto: CreatePostDto,
  ): Promise<BasePostsEntity> {
    const { title, content } = createpostDto;
    let repository = this.repositoryService.getRepository(boardType);

    try {
      const createdPost = repository.create({ title, content, userId: 1 });

      const savedPost = await repository.save(createdPost);

      return savedPost;
    } catch (err) {
      if (this.isDatabaseError(err)) {
        this.handleDatabaseError(err);
      } else {
        throw err;
      }
    }
  }

  //특정 게시글 조회
  async getPostDetails(boardType: BoardType, postId: number) {
    let repository = this.repositoryService.getRepository(boardType);
    try {
      const result = await repository.findOneBy({ postId });
      if (!result)
        throw new NotFoundException(
          `${boardType} 게시판에서 ${postId}번 게시물을 찾을 수 없습니다.`,
        );
      return result;
    } catch (err) {
      if (this.isDatabaseError(err)) {
        this.handleDatabaseError(err);
      } else {
        throw err;
      }
    }
  }

  //특정 게시글 신고
  //게시글 수정
  async updatePost(
    boardType: BoardType,
    postId: number,
    updatePostDto: UpdatePostDto,
  ) {
    let repository = this.repositoryService.getRepository(boardType);
    const { userId } = updatePostDto;
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
      if (this.isDatabaseError(err)) {
        this.handleDatabaseError(err);
      } else {
        throw err;
      }
    }
  }

  //게시글 삭제
  async deletePost(boardType: BoardType, postId: number) {
    let repository = this.repositoryService.getRepository(boardType);
    try {
      let userId = 1; // 차후 변경
      const post = await repository.findOneBy({ postId });
      if (!post)
        throw new NotFoundException(
          `${boardType} 게시판에서 ${postId}번 게시물을 찾을 수 없습니다.`,
        );

      if (post.userId !== userId) {
        throw new ForbiddenException('이 게시물을 수정할 권한이 없습니다.');
      }

      const updatedPost = await repository.softDelete(postId);
      return updatedPost;
    } catch (err) {
      if (this.isDatabaseError(err)) {
        this.handleDatabaseError(err);
      } else {
        throw err;
      }
    }
  }
}
