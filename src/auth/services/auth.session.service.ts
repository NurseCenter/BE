import { Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import Redis from 'ioredis';
import { Request, Response } from 'express';
import { sendCookieOptions } from '../cookie-options/send-cookie-options';

@Injectable()
export class AuthSessionService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  // 세션 ID (토큰) 생성하기
  async generateSessionId(): Promise<string> {
    return randomBytes(32).toString('hex');
  }

  // 세션 ID에서 세션 데이터 가져오기
  async getSessionData(sessionId: string): Promise<any | null> {
    try {
      const sessionData = await this.redisClient.get(`sess:${sessionId}`);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('세션 데이터 조회 중 에러 발생: ', error);
      return null;
    }
  }

  // 세션 ID에서 사용자 ID 찾기
  async findUserIdFromSession(sessionId: string): Promise<number | null> {
    const sessionObject = await this.getSessionData(sessionId);
    const userId = sessionObject?.passport?.user?.userId;
    return userId ? Number(userId) : null;
  }

  // 세션 ID로 세션 데이터 삭제하기
  async deleteSessionId(sessionId: string): Promise<void> {
    await this.redisClient.del(`sessionId:${sessionId}`);
  }

  // 쿠키 생성하기
  async sendCookie(res: Response, sessionId: string): Promise<boolean> {
    const returnedCookieOptions = sendCookieOptions();
    res.cookie('sessionId', sessionId, returnedCookieOptions);
    return true;
  }

  // 세션 정보 업데이트 후 Redis에 저장
  async updateSessionInfo(req: Request, userId: number, updatedUser: any): Promise<void> {
    const sessionId = req.sessionID;

    // 세션 정보 업데이트
    if (
      req.session &&
      req.session.passport &&
      req.session.passport.user &&
      req.session.passport.user.userId === userId
    ) {
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
      await this.redisClient.set(`sess:${sessionId}`, JSON.stringify(sessionData));
      // console.log('세션 데이터 Redis에 성공적으로 저장됨');
    } catch (error) {
      console.error('Redis에 세션 데이터 저장 실패: ', error);
      throw new Error('Redis에 세션 데이터 저장 실패');
    }
  }
}
