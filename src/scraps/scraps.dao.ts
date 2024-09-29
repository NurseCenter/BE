import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ScrapsEntity } from './entities/scraps.entity';
import { IPaginatedResponse } from 'src/common/interfaces';
import { IScrapedPostResponse } from './interfaces/scraped-post-response.interface';
// import { IScrapedPostResponse } from './interfaces/scraped-post-response.interface';

@Injectable()
export class ScrapsDAO {
  @InjectRepository(ScrapsEntity)
  private scrapsRepository: Repository<ScrapsEntity>;

  // 특정 사용자가 해당 게시물을 스크랩했는지 확인
  async checkIfScraped(userId: number, postId: number): Promise<boolean> {
    return await this.scrapsRepository.exists({ where: { userId, postId } });
  }

  // 스크랩 엔티티 생성
  async createScrap(userId: number, postId: number): Promise<ScrapsEntity> {
    const newScrap = new ScrapsEntity();
    newScrap.userId = userId;
    newScrap.postId = postId;
    return newScrap;
  }

  // 생성된 스크랩 엔티티 저장
  async saveScrap(scrap: ScrapsEntity): Promise<ScrapsEntity> {
    return await this.scrapsRepository.save(scrap);
  }

  // 본인이 스크랩한 게시물 조회
  async findMyScraps(
    userId: number,
    page: number,
    limit: number,
    sort: 'latest' | 'popular',
  ): Promise<IPaginatedResponse<any>> {
    const [items] = await this.scrapsRepository.findAndCount({
      where: {
        userId,
        deletedAt: null, // 스크랩 취소한 게시물 제외
      },
      relations: ['post'],
    });

    // null인 post를 필터링
    const filteredItems = items.filter((item) => item.post !== null && item.post.deletedAt === null);

    // 정렬 처리
    if (sort === 'popular') {
      filteredItems.sort((a, b) => b.post.likeCounts - a.post.likeCounts);
    } else {
      filteredItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    // 페이지네이션 처리
    const totalItems = filteredItems.length;
    const skip = (page - 1) * limit;
    const paginatedItems = filteredItems.slice(skip, skip + limit);

    const scrapedPosts: IScrapedPostResponse[] = paginatedItems.map((item) => ({
      postId: item.post.postId,
      boardType: item.post.boardType,
      title: item.post.title,
      viewCounts: item.post.viewCounts,
      likeCounts: item.post.likeCounts,
      createdAt: item.post.createdAt,
    }));

    return {
      items: scrapedPosts,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };
  }

  // 스크랩 ID로 특정 스크랩 조회
  async findScrapById(scrapId: number): Promise<ScrapsEntity | null> {
    return await this.scrapsRepository.findOneBy({ scrapId });
  }

  // 게시물 ID와 회원 ID로 특정 스크랩 조회
  async findScrapByUserIdAndPostId(userId: number, postId: number): Promise<ScrapsEntity | null> {
    return await this.scrapsRepository.findOne({ where: { userId, postId } });
  }

  // 스크랩 삭제
  async deleteScrap(scrapId: number): Promise<DeleteResult> {
    return await this.scrapsRepository.delete({ scrapId });
  }
}
