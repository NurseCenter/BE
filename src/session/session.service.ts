import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { SessionGateway } from './session.gateway';
import { Request, Response } from 'express';
import Redis from 'ioredis';
import { sendCookieOptions } from 'src/auth/services';

@Injectable()
export class SessionService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly sessionGateway: SessionGateway,
  ) {}

  // 세션 만료 알림 발송
  async monitorSession(sessionId: string): Promise<void> {
    try {
      console.log("monitorSession 함수 안")
      const ttl = await this.redisClient.ttl(`sess:${sessionId}`);
      const warningTime = this.calculateWarningTime(ttl);

      console.log("ttl", ttl)
      console.log("warningTime", warningTime)

        // Redis에서 해당 세션에 연결된 소켓 ID 확인
        let existingSocketId = await this.redisClient.get(`socket:${sessionId}`);

        console.log("Redis에서 해당 세션에 연결된 소켓 ID 확인", existingSocketId)

        if (!existingSocketId) {
          // 소켓 ID가 없으면 새로운 소켓을 생성하고 Redis에 저장
          console.log("existingSocketId가 없는 경우")
          await this.sessionGateway.createSocketForSession(sessionId, ttl);
          existingSocketId = await this.redisClient.get(`socket:${sessionId}`);
          console.log("existingSocketId ",existingSocketId )
        }

    // 소켓이 존재하면 세션 만료 알림을 전송
    if (existingSocketId) {
      console.log("existingSocketId", existingSocketId)
      // 알림 시간 설정
      if (warningTime > 0) {
        console.log("만료시간 후 알림 발송", warningTime)
        setTimeout(() => {
          this.sessionGateway.sendSessionExpiryWarning(sessionId); // 만료 알림 발송
        }, warningTime);
      } else {
        console.log("즉시 알림 발송", warningTime)
        this.sessionGateway.sendSessionExpiryWarning(sessionId); // 즉시 알림 발송
      }
    } else {
      console.log(`세션 ${sessionId}에 연결된 클라이언트가 없습니다.`);
    }
    } catch (error) {
      console.error('세션 모니터링 중 오류 발생:', error);
      throw new InternalServerErrorException('세션 모니터링에 실패했습니다.');
    }
  }

  // 세션 만료 알림 시간 계산
  private calculateWarningTime(ttl: number): number {
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      return ttl < 90 ? 0 : (ttl - 90); // 1분 30초 미만일 때 즉시 알림
    } else {
      return ttl < 30 * 60 ? 0 : (ttl - 30) * 60; // 30분 미만일 때 즉시 알림
    }
  }

  // 세션 연장
  async extendSession(req: Request, res: Response): Promise<void> {
    const sessionId = req.sessionID;
    const newExpiryTime = process.env.NODE_ENV === 'production' ? 2 * 60 * 60 : 2 * 60;

    try {
      // Redis에서 세션의 만료 시간 갱신
      await this.redisClient.expire(`session:${sessionId}`, newExpiryTime);

      const cookieValue = req.cookies['connect.sid'];
      const cookieOptions = sendCookieOptions();

      // connect.sid 쿠키 재발급
      res.cookie('connect.sid', cookieValue, {
        ...cookieOptions,
        maxAge: newExpiryTime * 1000, // 새 만료 시간
      });

      // 소켓의 시간 연장
      await this.redisClient.expire(`socket:s%3A${sessionId}`, newExpiryTime);

      console.log(`세션 연장 완료: ${newExpiryTime / 60}분`);
    } catch (error) {
      console.error('세션 연장 중 오류 발생:', error);
      throw new InternalServerErrorException('세션 연장에 실패했습니다.');
    }
  }
}
