import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsEntity } from './entities/base-posts.entity';
import { GetPostsQueryDto } from './dto/get-posts-query.dto';
import { ESortType, ESortOrder } from 'src/common/enums';
import { EBoardType } from './enum/board-type.enum';

@Injectable()
export class PostsDAO {
  constructor(
    @InjectRepository(PostsEntity)
    private readonly postsRepository: Repository<PostsEntity>,
  ) {}

  // 게시물 생성
  async createPost(title: string, content: string, userId: number, boardType: EBoardType): Promise<PostsEntity> {
    const post = this.postsRepository.create({
      title,
      content,
      userId,
      boardType,
    });
    return post;
  }

  // 전체 게시물 조회
  async findPosts(boardType: string, getPostsQueryDto: GetPostsQueryDto) {
    let {
      page,
      limit,
      search,
      sortOrder,
      sortType 
    } = getPostsQueryDto;

    page = Math.max(1, page || 1);
    limit = Math.min(Math.max(1, limit || 10), 50); // limit을 50 이하로 제한

    const query = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .select([
        'post.postId', // 게시물 ID
        'post.boardType', // 게시물 카테고리
        'post.title', // 게시물 제목
        'user.userId', // 작성자 ID
        'user.nickname', // 작성자 닉네임
        'post.createdAt', // 작성일
        'post.viewCounts', // 조회수
        'post.likeCounts', // 좋아요수
      ])
      .where('post.deletedAt IS NULL');

    if (boardType !== 'all') {
      query.where('post.boardType = :boardType', { boardType });
    }

    if (search) {
      query.andWhere('post.title LIKE :search OR post.content LIKE :search', { search: `%${search}%` });
    }

    sortType = Object.values(ESortType).includes(sortType) ? sortType : ESortType.DATE;
    sortOrder = Object.values(ESortOrder).includes(sortOrder) ? sortOrder : ESortOrder.DESC;

    // 정렬 조건에 따른 쿼리 설정
    const order = sortOrder === ESortOrder.ASC ? 'ASC' : 'DESC';

    switch (sortType) {
      // Date → 작성일 기준
      case ESortType.DATE:
        query.orderBy('post.createdAt', order).addOrderBy('post.postId', order);
        break;
      // likes → 좋아요수 기준
      case ESortType.LIKES:
        query
          .orderBy('post.likeCounts', order)
          .addOrderBy('post.createdAt', ESortOrder.DESC)
          .addOrderBy('post.postId', ESortOrder.DESC);
        break;
      default:
        query.orderBy('post.createdAt', ESortOrder.DESC).addOrderBy('post.postId', ESortOrder.DESC);
    }

    const [posts, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { posts: posts || [], total };
  }

  // 특정 게시글 조회 메소드
  async findPostById(postId: number) {
    return this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.postId = :postId', { postId })
      .andWhere('post.deletedAt IS NULL')
      .select([
        'post.postId', // 게시물 ID
        'post.boardType', // 카테고리
        'post.title', // 제목
        'post.content', // 내용
        'post.likeCounts', // 좋아요수
        'post.viewCounts', // 조회수
        'post.createdAt', // 작성일
        'post.updatedAt', // 수정일
        'post.deletedAt', // 삭제일
        'user.userId', // 작성자 ID
        'user.nickname', // 작성자 닉네임
      ])
      .getOne();
  }

  // 특정 게시물의 카테고리 일치 여부 확인
  async findPostByIdAndBoardType(postId: number, boardType: EBoardType) {
    const post = await this.postsRepository.findOne({
      where: { postId, boardType },
    });
    return !!post;
  }

  // 게시물 업데이트
  async updatePost(postId: number, updatedPost: Partial<PostsEntity>): Promise<void> {
    await this.postsRepository.update(postId, updatedPost);
  }

  // 본인이 작성한 게시물 조회
  async findMyPosts(userId: number, page: number, limit: number, sort: 'latest' | 'popular') {
    const queryBuilder = this.postsRepository
      .createQueryBuilder('post')
      .select([
        'post.postId', // 게시물 ID
        'post.boardType', // 카테고리
        'post.title', // 제목
        'post.viewCounts', // 조회수
        'post.likeCounts', // 좋아요수
        'post.createdAt', // 작성일
      ])
      .where('post.userId = :userId', { userId })
      .andWhere('post.deletedAt IS NULL')
      .skip((page - 1) * limit)
      .take(limit);

    // 정렬 기준
    if (sort === 'latest') {
      queryBuilder.orderBy('post.createdAt', 'DESC');
    } else if (sort === 'popular') {
      queryBuilder.orderBy('post.scrapCounts', 'DESC');
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // 게시물 관리 페이지 데이터 조회 및 검색
  async findAllPosts(page: number, limit: number, search?: string): Promise<[PostsEntity[], number]> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .select([
        'post.postId', // 게시물 ID (렌더링 X)
        'post.boardType', // 카테고리
        'post.title', // 제목
        'user.userId', // 작성자 ID (렌더링 X)
        'user.nickname', // 작성자 닉네임
        'post.createdAt', // 작성일자
      ])
      .where('post.deletedAt IS NULL') // 삭제된 게시물 제외
      .orderBy('post.createdAt', 'DESC') // 작성일 기준 내림차순
      .skip(skip)
      .take(limit);

    // 검색어 있을 경우
    if (search) {
      queryBuilder.andWhere('post.title LIKE :search OR post.content LIKE :search', { search: `%${search}%` });
    }

    const [posts, total] = await Promise.all([queryBuilder.getMany(), this.countTotalPosts(search)]);

    return [posts, total];
  }

  // 전체 게시물 수 계산
  async countTotalPosts(search?: string): Promise<number> {
    const queryBuilder = this.postsRepository.createQueryBuilder('post').where('post.deletedAt IS NULL');

    // 검색어가 존재할 경우
    if (search) {
      queryBuilder.andWhere('post.title LIKE :search OR post.content LIKE :search', { search: `%${search}%` });
    }

    const result = await queryBuilder.getCount();
    return result;
  }

  // 특정 게시물 저장
  async savePost(post: PostsEntity) {
    return this.postsRepository.save(post);
  }

  // 특정 게시물 삭제
  async deletePost(postId: number) {
    return this.postsRepository.softDelete(postId);
  }
}
