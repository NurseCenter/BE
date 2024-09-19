import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PostsMetricsDAO } from './posts-metrics-dao';
import { PostsDAO } from '../posts.dao';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PostsMetricsService {
  private readonly logger = new Logger(PostsMetricsService.name);

  constructor(
    private readonly postsMetricsDAO: PostsMetricsDAO,
    private readonly postsDAO: PostsDAO,
  ) {}

  // 좋아요 수 증가
  async incrementLikeCount(postId: number): Promise<void> {
    await this.postsMetricsDAO.increaseLikeCountInRedis(postId);
    await this.syncLikeCountsInMySQL(postId);
  }

  // 좋아요 수 감소
  async decrementLikeCount(postId: number): Promise<void> {
    await this.postsMetricsDAO.decreaseLikeCountInRedis(postId);
    await this.syncLikeCountsInMySQL(postId);
  }

  // 스크랩 수 증가
  async incrementScrapCount(postId: number): Promise<void> {
    await this.postsMetricsDAO.increaseScrapCountInRedis(postId);
    await this.syncScrapCountToMySQL(postId);
  }

  // 스크랩 수 감소
  async decrementScrapCount(postId: number): Promise<void> {
    await this.postsMetricsDAO.decreaseScrapCountInRedis(postId);
    await this.syncScrapCountToMySQL(postId);
  }

  // 게시물 조회할 때 조회수 증가시키기
  async incrementViewCount(postId: number, userId: number): Promise<void> {
    await this.postsMetricsDAO.increaseViewCount(postId);
    await this.syncViewCountToMySQL(postId);
  }

  // 좋아요수 동기화
  private async syncLikeCountsInMySQL(postId: number): Promise<void> {
    const post = await this.postsDAO.findPostById(postId);
    if (!post) {
      throw new NotFoundException('해당 게시물이 존재하지 않습니다.');
    }

    const likeCountsInRedis = await this.postsMetricsDAO.getLikeCountsFromRedis(postId);
    if (likeCountsInRedis === null) {
      throw new NotFoundException('좋아요 수 동기화 중 에러가 발생하였습니다.');
    }

    await this.postsMetricsDAO.setLikeCounts(postId, likeCountsInRedis);
  }

  // 스크랩수 동기화
  private async syncScrapCountToMySQL(postId: number): Promise<void> {
    const post = await this.postsDAO.findPostById(postId);
    if (!post) {
      throw new NotFoundException('해당 게시물이 존재하지 않습니다.');
    }

    const scrapCountsInRedis = await this.postsMetricsDAO.getScrapCountsFromRedis(postId);
    if (scrapCountsInRedis === null) {
      throw new NotFoundException('해당 게시물의 스크랩수 동기화 중 에러가 발생하였습니다.');
    }

    await this.postsMetricsDAO.setScrapCounts(postId, scrapCountsInRedis);
  }

  // 조회수 동기화
  private async syncViewCountToMySQL(postId: number): Promise<void> {
    const post = await this.postsDAO.findPostById(postId);
    if (!post) {
      throw new NotFoundException('해당 게시물이 존재하지 않습니다.');
    }

    const viewCountsInRedis = await this.postsMetricsDAO.getViewCountsFromRedis(postId);
    if (viewCountsInRedis === null) {
      throw new NotFoundException('해당 게시물의 조회수 동기화 중 에러가 발생하였습니다.');
    }

    await this.postsMetricsDAO.setViewCounts(postId, viewCountsInRedis);
  }

  // 조회수 스케줄러 설정 (1분 주기로 동기화)
  @Cron(CronExpression.EVERY_MINUTE)
  async syncViewCountEveryMinute() {
    const startTime = performance.now();
    this.logger.log('조회수 동기화 진행중');
    try {
      const keys = await this.postsMetricsDAO.getAllViewCountKeys();
      for (const key of keys) {
        const postId = parseInt(key.split(':')[1], 10);
        const viewCounts = await this.postsMetricsDAO.getViewCountsFromRedis(postId);

        if (viewCounts !== null) {
          await this.postsMetricsDAO.setViewCounts(postId, viewCounts);
        }

        await this.postsMetricsDAO.deleteViewCountKey(key);
      }
      const endTime = performance.now();
      this.logger.log(`동기화 작업 완료 (총 시간: ${(endTime - startTime).toFixed(2)}ms)`);
    } catch (error) {
      this.logger.error('조회수 동기화 작업 중 오류 발생: ', error);
    }
  }
}
