import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DeleteResult } from 'typeorm';
import { PostsEntity } from './entities/base-posts.entity';
import { GetPostsQueryDto } from './dto/get-posts-query.dto';
import { ESortType, EPostsBaseSortType } from 'src/common/enums';
import { EBoardType } from './enum/board-type.enum';
import { IPaginatedResponse } from 'src/common/interfaces';
import { ESearchPostByAdmin } from 'src/admin/enums';

@Injectable()
export class PostsDAO {
  constructor(
    @InjectRepository(PostsEntity)
    private readonly postsRepository: Repository<PostsEntity>,
  ) {}

  // 특정 게시물 ID들로 게시물 엔티티들을 조회
  async findPostsByIds(postIds: number[]): Promise<PostsEntity[]> {
    const posts = await this.postsRepository.findBy({ postId: In(postIds) });
    return posts.map((post) => ({
      ...post,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      deletedAt: post.deletedAt ? post.deletedAt : null,
    }));
  }

  // 특정 게시물 ID로 게시물 엔티티 조회
  async findPostEntityByPostId(postId: number): Promise<PostsEntity | null> {
    const post = await this.postsRepository.findOne({ where: { postId } });

    if (post) {
      return {
        ...post,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        deletedAt: post.deletedAt ? post.deletedAt : null,
      };
    }

    return null;
  }

  // 특정 게시물 ID로 게시물 엔티티 조회 (삭제된 게시물 포함)
  async findPostEntityByPostIdWithDeleted(postId: number): Promise<PostsEntity | null> {
    const post = await this.postsRepository.findOne({ where: { postId }, withDeleted: true });

    if (post) {
      return {
        ...post,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        deletedAt: post.deletedAt ? post.deletedAt : null,
      };
    }

    return null;
  }

  // 전체 게시물 조회
  async findAllPostsWithoutConditions(): Promise<PostsEntity[]> {
    const posts = await this.postsRepository.find();

    return posts.map((post) => ({
      ...post,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      deletedAt: post.deletedAt ? post.deletedAt : null,
    }));
  }

  // 게시물 생성
  async createPost(
    title: string,
    content: string,
    userId: number,
    hospitalNames: string[],
    boardType: EBoardType,
  ): Promise<PostsEntity> {
    const post = this.postsRepository.create({
      title,
      content,
      hospitalNames,
      userId,
      boardType,
    });
    return post;
  }

  // 전체 게시물 조회
  async findPosts(
    boardType: string,
    getPostsQueryDto: GetPostsQueryDto,
  ): Promise<{ posts: PostsEntity[]; total: number }> {
    let { page, limit, search, sortOrder, sortType } = getPostsQueryDto;

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
      query.andWhere('post.boardType = :boardType', { boardType });
    }

    if (search) {
      query.andWhere('(post.title LIKE :search OR post.content LIKE :search)', { search: `%${search}%` });
    }

    // console.log(query.getQuery());
    // console.log(query.getParameters());

    // 정렬
    switch (sortType) {
      case ESortType.LIKES:
        query.orderBy('post.likeCounts', sortOrder);
        break;
      case ESortType.VIEWCOUNTS:
        query.orderBy('post.viewCounts', sortOrder);
        break;
      default:
        query.orderBy('post.createdAt', sortOrder);
        break;
    }
    query.addOrderBy('post.postId', sortOrder);

    const [posts, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // 날짜 데이터 변환
    const convertedPosts = posts.map((post) => ({
      ...post,
      createdAt: post?.createdAt,
    }));

    return { posts: convertedPosts, total };
  }

  // 특정 게시글 조회 메소드
  async findOnePostByPostId(postId: number): Promise<PostsEntity> {
    const post = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.postId = :postId', { postId })
      .andWhere('post.deletedAt IS NULL')
      .select([
        'post.postId', // 게시물 ID
        'post.boardType', // 카테고리
        'post.title', // 제목
        'post.content', // 내용
        'post.hospitalNames', // 병원 이름 (배열)
        'post.likeCounts', // 좋아요수
        'post.viewCounts', // 조회수
        'post.scrapCounts', // 스크랩수
        'post.createdAt', // 작성일
        'post.updatedAt', // 수정일
        'post.deletedAt', // 삭제일
        'user.userId', // 작성자 ID
        'user.nickname', // 작성자 닉네임
      ])
      .getOne();

    // createdAt, updatedAt 변환
    if (post) {
      post.createdAt = post?.createdAt;
      post.updatedAt = post?.updatedAt;
    }

    return post;
  }

  // 특정 게시글 조회 메소드 (삭제된 것 포함)
  async findOnePostByPostIdWithDeleted(postId: number): Promise<PostsEntity> {
    const post = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.postId = :postId', { postId })
      .orWhere('post.deletedAt IS NOT NULL')
      .select([
        'post.postId', // 게시물 ID
        'post.boardType', // 카테고리
        'post.title', // 제목
        'post.content', // 내용
        'post.hospitalNames', // 병원 이름 (배열)
        'post.likeCounts', // 좋아요수
        'post.viewCounts', // 조회수
        'post.scrapCounts', // 스크랩수
        'post.createdAt', // 작성일
        'post.updatedAt', // 수정일
        'post.deletedAt', // 삭제일
        'user.userId', // 작성자 ID
        'user.nickname', // 작성자 닉네임
      ])
      .getOne();

    // createdAt, updatedAt 변환
    if (post) {
      post.createdAt = post?.createdAt;
      post.updatedAt = post?.updatedAt;
    }

    return post;
  }

  // 특정 게시물의 카테고리 일치 여부 확인
  async findPostByIdAndBoardType(postId: number, boardType: EBoardType): Promise<boolean> {
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
  async findMyPosts(
    userId: number,
    page: number,
    limit: number,
    sort: EPostsBaseSortType,
  ): Promise<IPaginatedResponse<PostsEntity>> {
    const skip = (page - 1) * limit;
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
      .orderBy('post.createdAt', 'DESC') // 작성일 기준 내림차순 정렬 (기본)
      .skip(skip)
      .take(limit);

    // 정렬 기준
    if (sort === 'viewCounts') {
      // 조회순
      queryBuilder.orderBy('post.viewCounts', 'DESC');
    } else if (sort === 'popular') {
      // 공감순
      queryBuilder.orderBy('post.likeCounts', 'DESC');
    } else if (sort === 'oldest') {
      // 작성순
      queryBuilder.orderBy('post.createdAt', 'ASC');
    } else {
      // 최신순
      queryBuilder.orderBy('post.createdAt', 'DESC');
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    // 날짜 데이터 변환
    const convertedItems = items.map((item) => ({
      ...item,
      createdAt: item.createdAt,
    }));

    return {
      items: convertedItems,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // 게시물 관리 페이지 데이터 조회 및 검색
  async findAllPostsByAdmin(
    page: number,
    limit: number,
    type?: ESearchPostByAdmin,
    search?: string,
  ): Promise<[PostsEntity[], number]> {
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
      .orderBy('post.createdAt', 'DESC') // 작성일 기준 내림차순 정렬 (기본)
      .skip(skip)
      .take(limit);

    // 검색어 있을 경우
    if (type && search) {
      switch (type) {
        case ESearchPostByAdmin.POST_ID:
          queryBuilder.andWhere('post.postId = :search', { search });
          break;
        case ESearchPostByAdmin.POST_TITLE:
          queryBuilder.andWhere('post.title LIKE :search', { search: `%${search}%` });
          break;
        case ESearchPostByAdmin.POST_CONTENT:
          queryBuilder.andWhere('post.content LIKE :search', { search: `%${search}%` });
          break;
        case ESearchPostByAdmin.POST_AUTHOR:
          queryBuilder.andWhere('user.nickname LIKE :search', { search: `%${search}%` });
          break;
      }
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
  async savePost(post: PostsEntity): Promise<PostsEntity> {
    return this.postsRepository.save(post);
  }

  // 특정 게시물 삭제
  async deletePost(postId: number): Promise<DeleteResult> {
    return this.postsRepository.softDelete(postId);
  }

  // 여러 게시물 삭제
  async deletePosts(postIds: number[]): Promise<{ affected: number; alreadyDeletedPostIds: number[] }> {
    const alreadyDeletedPostIds: number[] = [];

    const posts = await this.findPostsByIds(postIds);

    for (const postId of postIds) {
      const post = posts.find((post) => post.postId === postId);

      if (!post || post.deletedAt !== null) {
        alreadyDeletedPostIds.push(postId);
      } else {
        await this.postsRepository.softDelete(postId);
      }
    }

    const affectedCount = postIds.length - alreadyDeletedPostIds.length;

    return { affected: affectedCount, alreadyDeletedPostIds };
  }

  // 게시판 카테고리별 게시물 수 조회
  async countPostsByCategory(boardType?: EBoardType): Promise<{ boardType: EBoardType; count: number }[]> {
    const totalCount = await this.countAllposts();

    // boardType이 all인 경우 총 게시물 수만 반환
    if (boardType === 'all') {
      return [{ boardType: EBoardType.All, count: totalCount }];
    }

    const query = this.postsRepository
      .createQueryBuilder('post')
      .select('post.boardType', 'boardType')
      .addSelect('COUNT(post.postId)', 'count')
      .where('post.deletedAt IS NULL')
      .groupBy('post.boardType');

    if (boardType) {
      query.andWhere('post.boardType = :boardType', { boardType });
    }

    const results = await query.getRawMany();

    // 카테고리에 게시물이 없는 경우 count가 0으로 나오게 해야함.
    if (boardType) {
      return results.length > 0 ? results : [{ boardType, count: 0 }];
    }

    // 쿼리파라미터가 없을 때 all인 경우도 추가
    if (!boardType) {
      results.push({ boardType: 'all', count: totalCount });
    }

    const boardTypes = Object.values(EBoardType);
    const response = boardTypes.map((type) => {
      const found = results.find((result) => result.boardType === type);
      return { boardType: type as EBoardType, count: found ? found.count : 0 };
    });

    return response;
  }

  // 전체 게시물 수 구하기
  private async countAllposts(): Promise<number> {
    return this.postsRepository.count({ where: { deletedAt: null } });
  }

  // 게시물 ID로 제목과 카테고리만 반환하는 함수
  async findPostTitleAndBoardTypeByPostId(
    postId: number,
  ): Promise<{ postId: number; title: string; boardType: EBoardType } | null> {
    const post = await this.postsRepository
      .createQueryBuilder('post')
      .select(['post.title', 'post.boardType'])
      .where('post.postId = :postId', { postId })
      .andWhere('post.deletedAt IS NULL') // 삭제된 게시물 제외
      .getOne();

    return post ? { postId: post.postId, title: post.title, boardType: post.boardType } : null;
  }
}
