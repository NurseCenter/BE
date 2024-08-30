import { Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import createCookieOptions from './cookieOptions';
import Redis from 'ioredis';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthSessionService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly configService: ConfigService,
  ) {}

  // 세션 ID 생성하기
  async generateSessionId(): Promise<string> {
    return randomBytes(32).toString('hex');
  }

  // 세션 ID에서 사용자 ID 찾기
  async findUserIdFromSession(sessionId: string): Promise<number | null> {
    const userIdInRedis = await this.redisClient.hmget(`sessionId:${sessionId}`, 'userId');
    const userId = Number(userIdInRedis);
    return isNaN(userId) ? null : userId;
  }

  // 세션 ID 삭제하기
  async deleteSessionId(sessionId: string): Promise<void> {
    await this.redisClient.del(`sessionId:${sessionId}`);
  }

  // 쿠키 생성하기
  async sendCookie(res: Response, sessionId: string): Promise<boolean> {
    const returnedCookieOptions = await createCookieOptions();
    console.log('returnedCookieOptions', returnedCookieOptions);
    res.cookie('sessionId', sessionId, returnedCookieOptions);
    return true;
  }
}
