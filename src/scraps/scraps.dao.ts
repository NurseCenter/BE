import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ScrapsEntity } from './entities/scraps.entity';

@Injectable()
export class ScrapsDAO {
  @InjectRepository(ScrapsEntity)
  private scrapsRepository: Repository<ScrapsEntity>;

  // 특정 사용자가 해당 게시물을 스크랩했는지 확인
  async checkIfScraped(userId: number, postId: number) {
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
  async saveScrap(scrap: ScrapsEntity) {
    return await this.scrapsRepository.save(scrap);
  }

  // 본인이 스크랩한 게시물 조회
  async findMyScraps(userId: number, page: number, limit: number, sort: 'latest' | 'popular') {
    const skip = (page - 1) * limit;
    const queryBuilder = this.scrapsRepository
      .createQueryBuilder('scrap')
      .leftJoinAndSelect('scrap.post', 'post')
      .where('scrap.userId = :userId', { userId })
      .andWhere('post.deletedAt IS NULL')
      .select([
        'post.postId AS postId', // 게시물 ID
        'post.boardType AS boardType', // 카테고리
        'post.title AS tilte', // 제목
        'post.viewCounts AS viewCounts', // 조회수
        'post.likeCounts AS likeCounts', // 좋아요수
        'post.createdAt AS createdAt', // 작성일
      ])
      .skip(skip)
      .take(limit);

    // 정렬 기준
    if (sort === 'latest') {
      queryBuilder.orderBy('post.createdAt', 'DESC');
    } else if (sort === 'popular') {
      queryBuilder.orderBy('post.likeCounts', 'DESC');
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
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
