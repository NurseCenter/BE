import { Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import createCookieOptions from './cookieOptions';
import Redis from 'ioredis';
import { Request, Response } from 'express';

@Injectable()
export class AuthSessionService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  // 세션 ID (토큰) 생성하기
  async generateSessionId(): Promise<string> {
    return randomBytes(32).toString('hex');
  }

  // 세션 ID에서 사용자 ID 찾기
  async findUserIdFromSession(sessionId: string): Promise<number | null> {
    // 직접 Redis에서 세션 데이터 가져오기
    const sessionData = await this.redisClient.get(`sess:${sessionId}`);

    console.log('sessionData', sessionData);

    // 세션 데이터가 존재하는지 확인
    if (sessionData) {
      // 세션 데이터는 JSON 문자열로 저장되므로 파싱
      const sessionObject = JSON.parse(sessionData);

      // 사용자 ID 반환
      const userId = sessionObject.passport.user.userId;
      return userId ? Number(userId) : null;
    }

    return null;
  }

  // 세션 ID 삭제하기
  async deleteSessionId(sessionId: string): Promise<void> {
    await this.redisClient.del(`sessionId:${sessionId}`);
  }

  // 쿠키 생성하기
  async sendCookie(res: Response, sessionId: string): Promise<boolean> {
    const returnedCookieOptions = await createCookieOptions();
    res.cookie('sessionId', sessionId, returnedCookieOptions);
    return true;
  }

  // 세션 정보 업데이트 후 Redis에 저장
  async updateSessionInfo(req: Request, userId: number, updatedUser: any): Promise<void>{
    const sessionId = req.sessionID;
    
    // 세션 정보 업데이트
    if (req.session && req.session.passport && req.session.passport.user && req.session.passport.user.userId === userId) {
      req.session.passport.user = {
        ...req.session.passport.user,
        nickname: updatedUser.nickname,
      };
    }

     // Redis에 세션 업데이트
     await this.updateSessionInRedis(sessionId, req.session);
  }

  // Redis에 세션 데이터 저장
  private async updateSessionInRedis(sessionId: string, sessionData: any): Promise<void> {
    try {
      await this.redisClient.set(`sess:${sessionId}`, JSON.stringify((sessionData)));
      console.log('세션 데이터 Redis에 성공적으로 저장됨');
    } catch (error) {
      console.error('Redis에 세션 데이터 저장 실패: ', error);
      throw new Error('Redis에 세션 데이터 저장 실패');
    }
  }
}
