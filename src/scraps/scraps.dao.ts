import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ScrapsEntity } from './entities/scraps.entity';
import { IPaginatedResponse } from 'src/common/interfaces';
import { IScrapedPostResponse } from './interfaces/scraped-post-response.interface';
import { EPostsBaseSortType } from 'src/common/enums';
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
    sort: EPostsBaseSortType,
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
      // 인기순
      filteredItems.sort((a, b) => b.post.likeCounts - a.post.likeCounts);
    } else if (sort === 'viewCounts') {
      // 조회순
      filteredItems.sort((a, b) => b.post.viewCounts - a.post.viewCounts);
    } else if (sort === 'oldest') {
      // 작성순
      filteredItems.sort((a, b) => a.post.createdAt.getTime() - b.post.createdAt.getTime());
    } else {
      // 최신순 (기본)
      filteredItems.sort((a, b) => b.post.createdAt.getTime() - a.post.createdAt.getTime());
    }

    // 페이지네이션 처리
    const totalItems = filteredItems.length;
    const skip = (page - 1) * limit;
    const paginatedItems = filteredItems.slice(skip, skip + limit);

    const scrapedPosts: IScrapedPostResponse[] = paginatedItems.map((item) => ({
      postId: item.post.postId, // 게시물 ID
      boardType: item.post.boardType, // 게시물 카테고리
      title: item.post.title, // 제목
      viewCounts: item.post.viewCounts, // 조회수
      likeCounts: item.post.likeCounts, // 좋아요수
      createdAt: item.post.createdAt, // 게시물 작성일
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
    return await this.scrapsRepository.findOne({ where: { userId, postId }, withDeleted: true });
  }

  // 스크랩 삭제
  async deleteScrap(scrapId: number): Promise<DeleteResult> {
    return await this.scrapsRepository.softDelete({ scrapId });
  }
}
