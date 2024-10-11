import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PostsMetricsDAO } from './posts-metrics-dao';
import { PostsDAO } from '../posts.dao';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PostsEntity } from '../entities/base-posts.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PostsMetricsService {
  private readonly logger = new Logger(PostsMetricsService.name);

  constructor(
    private readonly postsMetricsDAO: PostsMetricsDAO,
    private readonly postsDAO: PostsDAO,
    @InjectRepository(PostsEntity)
    private readonly postsRepository: Repository<PostsEntity>,
  ) {}
  ///////////////
  /// 좋아요수 ///
  ///////////////

  // 좋아요 수 증가 (MySQL)
  async incrementLikeCountInMySQL(postId: number): Promise<string> {
    const post = await this.postsDAO.findOnePostByPostId(postId);
    post.likeCounts += 1;
    this.postsRepository.save(post);
    return `${postId}번 게시물의 좋아요수: ${post.likeCounts}`;
  }

  // 좋아요 수 감소 (MySQL)
  async decrementLikeCountInMySQL(postId: number): Promise<string> {
    const post = await this.postsDAO.findOnePostByPostId(postId);
    post.likeCounts -= 1;
    this.postsDAO.savePost(post);
    return `${postId}번 게시물의 좋아요수: ${post.likeCounts}`;
  }

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

  ///////////////
  /// 스크랩수 ///
  ///////////////

  // 스크랩 수 증가 (MySQL)
  async incrementScrapCountInMySQL(postId: number): Promise<string> {
    const post = await this.postsDAO.findOnePostByPostId(postId);
    post.scrapCounts += 1;
    this.postsDAO.savePost(post);
    return `${postId}번 게시물의 스크랩수: ${post.scrapCounts}`;
  }

  // 스크랩 수 감소 (MySQL)
  async decrementScrapCountInMySQL(postId: number): Promise<string> {
    const post = await this.postsDAO.findOnePostByPostId(postId);
    post.scrapCounts -= 1;
    this.postsDAO.savePost(post);
    return `${postId}번 게시물의 좋아요수: ${post.scrapCounts}`;
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

  ///////////////
  //// 조회수 ////
  ///////////////

  // 게시물 조회할 때 조회수 증가시키기
  async incrementViewCount(postId: number): Promise<void> {
    await this.postsMetricsDAO.increaseViewCount(postId);
    await this.syncViewCountToMySQL(postId);
  }

  ///////////////
  //// 동기화 ////
  ///////////////

  // 좋아요수 동기화
  private async syncLikeCountsInMySQL(postId: number): Promise<void> {
    const post = await this.postsDAO.findOnePostByPostId(postId);
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
    const post = await this.postsDAO.findOnePostByPostId(postId);
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
    const post = await this.postsDAO.findOnePostByPostId(postId);
    if (!post) {
      console.warn(`게시물 ID ${postId}가 존재하지 않습니다. 조회수 동기화를 건너뜁니다.`);
      return null; // 게시물 없으면 종료
    }

    const viewCountsInRedis = await this.postsMetricsDAO.getViewCountsFromRedis(postId);
    if (viewCountsInRedis === null) {
      throw new NotFoundException('해당 게시물의 조회수 동기화 중 에러가 발생하였습니다.');
    }

    await this.postsMetricsDAO.setViewCounts(postId, viewCountsInRedis);
  }

  // 조회수 스케줄러 설정 (1분 주기로 동기화)
  @Cron(CronExpression.EVERY_MINUTE)
  async syncViewCountEveryMinute(): Promise<void> {
    const startTime = performance.now();
    this.logger.log('조회수 동기화 진행중');
    try {
      const keys = await this.postsMetricsDAO.getAllViewCountKeys();
      for (const key of keys) {
        const postId = parseInt(key.split(':')[1], 10);
        const post = await this.postsDAO.findOnePostByPostId(postId);

        if (!post) {
          this.logger.warn(`게시물 ID ${postId}가 존재하지 않습니다. 동기화를 건너뜁니다.`);
          continue;
        }

        const viewCountsFromRedis = await this.postsMetricsDAO.getViewCountsFromRedis(postId);

        if (viewCountsFromRedis !== null) {
          const newViewCounts = post.viewCounts + viewCountsFromRedis;
          await this.postsMetricsDAO.setViewCounts(postId, newViewCounts);
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
