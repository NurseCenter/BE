import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsEntity } from '../entities/base-posts.entity';
import Redis from 'ioredis';

@Injectable()
export class PostsMetricsDAO {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    @InjectRepository(PostsEntity)
    private readonly postsRepository: Repository<PostsEntity>,
  ) {}

  // Redis에서 좋아요수 증가
  async increaseLikeCountInRedis(postId: number): Promise<void> {
    await this.redisClient.incr(`post:${postId}:likes`);
  }

  // Redis에서 좋아요수 감소
  async decreaseLikeCountInRedis(postId: number): Promise<void> {
    await this.redisClient.decr(`post:${postId}:likes`);
  }

  // Redis에서 스크랩수 증가
  async increaseScrapCountInRedis(postId: number): Promise<void> {
    await this.redisClient.incr(`post:${postId}:scraps`);
  }

  // Redis에서 스크랩수 감소
  async decreaseScrapCountInRedis(postId: number): Promise<void> {
    await this.redisClient.decr(`post:${postId}:scraps`);
  }

  // Redis에서 게시물 조회수 증가
  async increaseViewCount(postId: number): Promise<void> {
    await this.redisClient.incr(`post:${postId}:views`);
  }

  // Redis에서 좋아요수 가져오기
  async getLikeCountsFromRedis(postId: number): Promise<number | null> {
    const likeCounts = await this.redisClient.get(`post:${postId}:likes`);
    return likeCounts ? parseInt(likeCounts, 10) : null;
  }

  // Redis에서 스크랩수 가져오기
  async getScrapCountsFromRedis(postId: number): Promise<number | null> {
    const scrapCounts = await this.redisClient.get(`post:${postId}:scraps`);
    return scrapCounts ? parseInt(scrapCounts, 10) : null;
  }

  // Redis에서 조회수 가져오기
  async getViewCountsFromRedis(postId: number): Promise<number | null> {
    const viewCounts = await this.redisClient.get(`post:${postId}:views`);
    return viewCounts ? parseInt(viewCounts, 10) : null;
  }

  // MySQL의 좋아요수 설정
  async setLikeCounts(postId: number, newLikeCounts: number): Promise<void> {
    await this.postsRepository.update({ postId }, { likeCounts: newLikeCounts });
  }

  // MySQL의 스크랩수 설정
  async setScrapCounts(postId: number, newScrapCounts: number): Promise<void> {
    await this.postsRepository.update({ postId }, { scrapCounts: newScrapCounts });
  }

  // MySQL의 조회수 설정
  async setViewCounts(postId: number, newViewCounts: number): Promise<void> {
    await this.postsRepository.update({ postId }, { viewCounts: newViewCounts });
  }

  // Redis에서 모든 조회수 키 가져오기
  async getAllViewCountKeys(): Promise<string[]> {
    return await this.redisClient.keys('post:*:views');
  }

  // Redis에서 조회수 키 삭제
  async deleteViewCountKey(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
