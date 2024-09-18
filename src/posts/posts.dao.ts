import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsEntity } from './entities/base-posts.entity';

@Injectable()
export class PostsDAO {
  constructor(
    @InjectRepository(PostsEntity)
    private readonly postsRepository: Repository<PostsEntity>,
  ) {}

  // PostId로 게시물 조회
  async findPostById(postId: number) {
    return await this.postsRepository.findOneBy({ postId })
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
        'post.like', // 공감수
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
        'user.nickname', // 작성자(닉네임)
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

  // 특정 게시물 삭제
  async deletePost(postId: number): Promise<PostsEntity | null> {
    const post = await this.postsRepository.findOne({
      where: { postId, deletedAt: null },
    });

    if (post) {
      post.deletedAt = new Date();
      await this.postsRepository.save(post);
      return post;
    }

    return null; // 게시물이 없거나 이미 삭제된 경우
  }
}
