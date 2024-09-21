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

  // 특정 회원이 스크랩한 게시물들 조회
  async findScrapsByUser(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: any[]; totalItems: number }> {
    const queryBuilder = this.scrapsRepository
      .createQueryBuilder('scrap')
      .leftJoinAndSelect('scrap.post', 'post')
      .where('scrap.userId = :userId', { userId })
      .andWhere('scrap.deletedAt IS NULL')
      .select([
        'scrap.scrapId', // 스크랩 ID
        'scrap.userId', // 회원 ID
        'scrap.createdAt', // 스크랩한 날짜
        'post.postId', // 게시물 ID
        'post.boardType', // 게시물 카테고리
        'post.title', // 게시물 제목
        'post.createdAt AS createdAt', // 게시물 작성일
      ])
      .orderBy('scrap.createdAt', 'DESC');

    const [items, totalItems] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany();

    return { items, totalItems };
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
