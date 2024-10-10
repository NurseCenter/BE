import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { SessionGateway } from './session.gateway';
import { Request } from 'express';
import Redis from 'ioredis';

@Injectable()
export class SessionService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly sessionGateway: SessionGateway,
  ) {}

  // // 세션 만료 알림 발송
  // async monitorSession(sessionId: string): Promise<void> {
  //   // Redis에서 세션의 TTL을 확인하여 시간 설정
  //   // 세션 만료 30분 전 알림
  //   const ttl = await this.redisClient.ttl(`session:${sessionId}`);
  //   const warningTime = ttl > 0 ? (ttl - 30 * 60) * 1000 : 0;

  //   if (warningTime > 0) {
  //     setTimeout(() => {
  //       this.sessionGateway.sendSessionExpiryWarning(sessionId);
  //     }, warningTime);
  //   }
  // }

  // 세션 만료 알림 발송 (로그인 후 5초 후에 발송되도록 함)
  async monitorSession(sessionId: string): Promise<void> {
    try {
      setTimeout(() => {
        this.sessionGateway.sendSessionExpiryWarning(sessionId);
      }, 5000);
    } catch (error) {
      console.error('세션 모니터링 중 오류 발생:', error);
      throw new InternalServerErrorException('세션 모니터링에 실패했습니다.');
    }
  }
  
  // 세션 연장
  async extendSession(req: Request): Promise<void> {
    const sessionId = req.sessionID;
    const newExpiryTime = 2 * 60 * 60; // 2시간

    try {
      // Redis에서 세션의 만료 시간 갱신
      await this.redisClient.expire(`session:${sessionId}`, newExpiryTime);
    } catch (error) {
      console.error('세션 연장 중 오류 발생:', error);
      throw new InternalServerErrorException('세션 연장에 실패했습니다.');
    }
  }
}
