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


  /**
   * 세션 만료 알림 발송
   * 세션 만료 30분 전 알림 (배포 환경), 1분 전 알림 (로컬 환경)
   * @param sessionId 세션 ID
   */
  async monitorSession(sessionId: string): Promise<void> {
    try {
      const ttl = await this.redisClient.ttl(`session:${sessionId}`);
  
      if (ttl <= 0) {
        console.log(`세션 ${sessionId}은 만료되었습니다.`);
        return;  // 세션이 만료되었으면 더 이상 처리할 필요 없음
      }
  
      const warningTime = this.getWarningTime(ttl);
      if (warningTime > 0) {
        await this.redisClient.zadd('session_expiry_queue', warningTime, sessionId);
      } else {
        // sessionId로 클라이언트의 Socket을 찾고 알림을 보냄
        const clientSocket = await this.sessionGateway.getSocketBySessionId(sessionId);
        if (clientSocket) {
          this.sessionGateway.sendSessionExpiryWarning(clientSocket);
        }
      }
    } catch (error) {
      console.error('세션 모니터링 중 오류 발생:', error);
      throw new InternalServerErrorException('세션 모니터링에 실패했습니다.');
    }
  }

    /**
   * 배포 환경과 로컬 환경에 맞는 알림 기준 시간을 계산
   * @param ttl 남은 TTL 시간
   * @returns 경고를 보내야 하는 시간
   */
    private getWarningTime(ttl: number): number {
      const warningThreshold = process.env.NODE_ENV === 'production' ? 30 * 60 : 60; // 30분 또는 1분
      return ttl - warningThreshold;
    }
 /**
   * 세션 연장
   * @param req 요청 객체
   * @param res 응답 객체
   */
 async extendSession(req: Request, res: Response): Promise<void> {
  const sessionId = req.sessionID;
  const newExpiryTime = parseInt(process.env.SESSION_TTL || '7200'); // 2시간

  try {
    // Redis에서 세션의 만료 시간 갱신
    await this.redisClient.expire(`session:${sessionId}`, newExpiryTime);

    const cookieValue = req.cookies['connect.sid'];
    const cookieOptions = sendCookieOptions();

    // connect.sid 쿠키 재발급
    res.cookie('connect.sid', cookieValue, {
      ...cookieOptions,
      maxAge: newExpiryTime * 1000, // 2시간
    });

    // 소켓의 TTL 갱신
    await this.redisClient.expire(`socket:s%3A${sessionId}`, newExpiryTime);
  } catch (error) {
    console.error('세션 연장 중 오류 발생:', error);
    throw new InternalServerErrorException('세션 연장에 실패했습니다.');
  }
}
}
