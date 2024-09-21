import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { IUserWithoutPassword } from '../auth/interfaces/session-decorator.interface';
import { PostsDAO } from 'src/posts/posts.dao';
import { ScrapsDAO } from './scraps.dao';
import { ScrapsEntity } from './entities/scraps.entity';
import { PaginationQueryDto } from 'src/common/dto';
import { IPaginatedResponse } from 'src/common/interfaces';
import { PostsMetricsService } from 'src/posts/metrics/posts-metrics.service';

@Injectable()
export class ScrapService {
  constructor(
    private readonly scrapsDAO: ScrapsDAO,
    private readonly postsDAO: PostsDAO,
    private readonly postsMetricsService: PostsMetricsService,
  ) {}

  // 게시물 스크랩
  async scrapPost(postId: number, sessionUser: IUserWithoutPassword): Promise<ScrapsEntity> {
    const { userId } = sessionUser;

    const post = await this.postsDAO.findPostById(postId);
    if (!post) throw new NotFoundException(`${postId}번 게시글을 찾을 수 없습니다`);

    const isAlreadyScraped = await this.scrapsDAO.checkIfScraped(userId, postId);
    if (isAlreadyScraped) throw new ConflictException(`이미 ${postId}번 게시글을 스크랩했습니다.`);

    const createdScrap = await this.scrapsDAO.createScrap(userId, postId);
    await this.scrapsDAO.saveScrap(createdScrap);

    await this.postsMetricsService.incrementScrapCountInMySQL(postId);

    return createdScrap;
  }

  // 스크랩한 게시물들 조회
  async getScrapedPosts(
    sessionUser: IUserWithoutPassword,
    paginationQueryDto: PaginationQueryDto,
  ): Promise<IPaginatedResponse<any>> {
    const { page, limit } = paginationQueryDto;
    const { items, totalItems } = await this.scrapsDAO.findScrapsByUser(sessionUser.userId, page, limit);

    const formattedItems = items.map((item) => ({
      scrapId: item.scrapId, // 스크랩 ID
      userId: item.userId, // 회원 ID
      createdAt: item.createdAt, // 스크랩한 날짜
      post: {
        postId: item.post_postId, // 게시물 ID
        boardType: item.post_boardType, // 게시물 카테고리
        title: item.post_title, // 게시물 제목
        createdAt: item.postCreatedAt, // 게시물 작성일
      },
    }));

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items: formattedItems,
      totalItems,
      totalPages,
      currentPage: page,
    };
  }

  // 특정 게시물 스크랩 취소
  async deleteScrapedPost(postId: number, sessionUser: IUserWithoutPassword): Promise<{ message: string }> {
    const { userId } = sessionUser;
    const scrapPost = await this.scrapsDAO.findScrapByUserIdAndPostId(userId, postId);

    if (!scrapPost) throw new NotFoundException(`스크랩한 게시물을 찾을 수 없습니다.`);
    if (scrapPost.userId !== userId) throw new ForbiddenException(`스크랩을 취소할 권한이 없습니다.`);

    // 스크랩 취소(삭제)
    const result = await this.scrapsDAO.deleteScrap(scrapPost.scrapId);
    if (result.affected === 0) {
      throw new NotFoundException(`스크랩 취소 중 오류가 발생하였습니다.`);
    }

    await this.postsMetricsService.decrementScrapCountInMySQL(postId);

    return { message: '스크랩이 취소되었습니다.' };
  }
}
