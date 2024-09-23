import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ScrapsEntity } from './entities/scraps.entity';
import { IPaginatedResponse } from 'src/common/interfaces';
import { IScrapedPostResponse } from './interfaces/scraped-post-response.interface';

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
    const skip = (page - 1) * limit;

    const [items, total] = await this.scrapsRepository.findAndCount({
      where: { userId },
      relations: ['post'],
      skip,
      take: limit,
      select: {
        post: {
          postId: true,
          boardType: true,
          title: true,
          viewCounts: true,
          likeCounts: true,
          createdAt: true,
        },
      },
    });

    // 정렬 처리
    if (sort === 'popular') {
      items.sort((a, b) => b.post.likeCounts - a.post.likeCounts);
    } else {
      items.sort((a, b) => b.post.createdAt.getTime() - a.post.createdAt.getTime());
    }

    const scrapedPosts: IScrapedPostResponse[] = items.map((item) => ({
      postId: item.post.postId,
      boardType: item.post.boardType,
      title: item.post.title,
      viewCounts: item.post.viewCounts,
      likeCounts: item.post.likeCounts,
      createdAt: item.post.createdAt,
    })) as IScrapedPostResponse[];

    return {
      items: scrapedPosts,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
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
