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

  // 세션 만료 알림 발송
  async monitorSession(sessionId: string): Promise<void> {
    try {
      // 배포 환경에서는 세션 만료 30분 전에 알림 전송
      if (process.env.NODE_ENV === 'production') {
        const ttl = await this.redisClient.ttl(`session:${sessionId}`);
        const warningTime = ttl > 0 ? (ttl - 30 * 60) * 1000 : 0;

        if (warningTime > 0) {
          setTimeout(() => {
            this.sessionGateway.sendSessionExpiryWarning(sessionId);
          }, warningTime);
        }
      } else {
        // 개발 환경에서는 5초 후에 발송
        setTimeout(() => {
          this.sessionGateway.sendSessionExpiryWarning(sessionId);
        }, 5000);
      }
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
