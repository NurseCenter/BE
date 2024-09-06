import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PostsEntity } from "./entities/base-posts.entity";

@Injectable()
export class PostsDAO {
  constructor(
    @InjectRepository(PostsEntity)
    private readonly postsRepository: Repository<PostsEntity>,
  ) {}

  // 본인이 작성한 게시물 조회
  async findUserPosts(userId: number, page: number, limit: number, sort: 'latest' | 'popular') {
    const queryBuilder = this.postsRepository.createQueryBuilder('post')
      .where('post.userId = :userId', { userId })
      .andWhere('post.deletedAt IS NULL')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy(sort === 'latest' ? 'post.createdAt' : 'post.scrapCounts', sort === 'latest' ? 'DESC' : 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

    // 게시물 관리 페이지 데이터 조회
    async findAllPosts(pageNumber: number, pageSize: number): Promise<[PostsEntity[], number]> {
        const skip = (pageNumber - 1) * pageSize;
    
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
          .take(pageSize);
    
        const [posts, total] = await Promise.all([queryBuilder.getRawMany(), this.countTotalPosts()]);
    
        return [posts, total];
      }
    
      // 전체 게시물 수 계산
      async countTotalPosts(): Promise<number> {
        const result = await this.postsRepository
          .createQueryBuilder('post')
          .select('COUNT(post.postId)', 'total')
          .where('post.deletedAt IS NULL') // 삭제된 게시물 제외
          .getRawOne();
        return Number(result.total);
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