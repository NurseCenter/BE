import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { extractSessionIdFromCookie } from 'src/common/utils';
import { getAllowedOrigins } from 'src/config/cors.config';

@WebSocketGateway({
  cors: {
    origin: getAllowedOrigins(process.env.NODE_ENV),
    credentials: true,
  },
})
export class SessionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  // 클라이언트 연결 시 호출
  async handleConnection(client: Socket) {
    const cookies = client.handshake.headers?.cookie;
    const sessionId = extractSessionIdFromCookie(cookies);

    console.log("handleConnection - sessionID", sessionId)

    if (!sessionId) {
      console.error('세션 ID를 찾을 수 없습니다.');
      return;
    }

    client.join(sessionId);

    try {
      // 세션 만료 시간 가져오기
      const parsed_sessionId = sessionId.replace('s%3A', '');
      const ttl = await this.getSessionExpirationTime(parsed_sessionId);

      console.log("parsed_sessionId", parsed_sessionId)

      console.log("ttl", ttl)

      if (!ttl || ttl <= 0) {
        console.warn('세션 만료 시간을 가져올 수 없거나 세션이 이미 만료되었습니다.');
        return;
      }

      // 소켓 ID를 Redis에 저장
      await this.saveSocketIdToRedis(sessionId, client.id, ttl)
        await this.handleExistingSocket(sessionId, ttl);
    } catch (error) {
      console.error('세션 연결 처리 중 오류 발생:', error);
    }
  }

  // Redis에서 세션 정보를 가져와 세션 만료 시간 계산
  private async getSessionExpirationTime(sessionId: string): Promise<number | null> {
    try {
      // Redis에서 세션 정보 가져오기
      const sessionData = await this.redisClient.get(`sess:${sessionId}`);

      if (!sessionData) {
        console.log(`세션 ${sessionId}의 데이터를 Redis에서 찾을 수 없습니다.`);
        return 0;
      }

      const session = JSON.parse(sessionData);
      return session.cookie?.originalMaxAge || 0;
    } catch (err) {
      console.error('세션 만료 시간 계산 중 오류 발생:', err);
      return 0;
    }
  }

  // // Redis에서 소켓 ID 가져오기
  // private async getSocketIdFromRedis(sessionId: string): Promise<string | null> {
  //   try {
  //     // Redis key 생성 후 socketId 가져오기
  //     const redisKey = `socket:${sessionId}`;
  //     const socketId = await this.redisClient.get(redisKey);

  //     console.log("socketId", socketId)

  //     if (socketId === null) {
  //       console.log(`Redis에 해당 key(${redisKey})가 존재하지 않습니다.`);
  //     } else {
  //       console.log('존재하는 socketId:', socketId);
  //     }

  //     return socketId;
  //   } catch (err) {
  //     console.error('Redis에서 소켓 ID를 가져오는 중 오류 발생:', err);
  //     return null;
  //   }
  // }

  // 기존 소켓으로 세션 만료 알림 전송
  private async handleExistingSocket(sessionId: string, ttl: number) {
    // 세션 만료 알림 시간을 계산
    const warningTime = this.calculateWarningTime(ttl);

    console.log("warningTime", warningTime)

    // 알림 시간이 0보다 크면 설정
    if (warningTime > 0) {
      setTimeout(() => {
        this.sendSessionExpiryWarning(sessionId.replace('s%3A', ''));
      }, warningTime * 1000);
    }
  }

  // 새 소켓 ID Redis에 저장
  private async saveSocketIdToRedis(sessionId: string, socketId: string, ttl: number) {
    await this.redisClient.set(`socket:${sessionId}`, socketId, 'EX', ttl);
    console.log(`새 소켓 ID 저장 완료: ${socketId}, TTL: ${ttl}`);
  }

  // 클라이언트 연결 종료 시 호출되는 메서드
  handleDisconnect(client: Socket) {
    const sessionId = extractSessionIdFromCookie(client.handshake.headers?.cookie);
    if (sessionId) {
      this.redisClient.del(`socket:${sessionId}`, (err) => {
        if (err) {
          console.error(`세션 ${sessionId}의 소켓 ID 삭제 중 오류 발생:`, err);
        }
      });
    }
  }

  // 세션 만료 알림 전송
  sendSessionExpiryWarning(sessionId: string) {
    this.redisClient.get(`socket:${sessionId}`, (err, socketId) => {
      if (err) {
        console.error('Redis에서 소켓 ID를 가져오는 중 오류 발생:', err);
        return;
      }

      if (socketId) {
        const message = this.createSessionExpiryMessage();
        this.server.to(socketId).emit('sessionExpiryWarning', { message });
      } else {
        console.log(`세션 ${sessionId}에 연결된 클라이언트가 없습니다.`);
      }
    });
  }

  // 세션 강제 종료
  async deleteSocket(sessionId: string): Promise<void> {
    const socketId = await this.redisClient.get(`socket:${sessionId}`);

    if (socketId) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) {
        socket.disconnect(true);
      }
      await this.redisClient.del(`socket:${sessionId}`);
    }
  }

  // 세션 만료 메시지 생성
  // 개발환경 : 로그인 후 30초 (만료: 2분)
  // 배포환경 : 1시간 30분 후 (만료: 2시간)
  private createSessionExpiryMessage(): string {
    return process.env.NODE_ENV === 'production'
      ? '세션이 30분 후 만료됩니다. 연장하시겠습니까?'
      : '세션이 10초 후 만료됩니다. 연장하시겠습니까?';
  }

  // 세션 만료 알림 시간 계산
   private calculateWarningTime(ttl: number): number {
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      return ttl < 90 ? 0 : ttl - 90 * 1000; // 1분 30초 미만일 때 즉시 알림
    } else {
      return ttl < 30 * 60 ? 0 : (ttl - 30 * 60) * 1000; // 30분 미만일 때 즉시 알림
    }
  }

  async createSocketForSession(sessionId: string, ttl: number): Promise<void> {
    const socketId = this.generateSocketId();  // 새로운 소켓 ID 생성
    console.log("createSocketForSession 메서드, sessionId", sessionId, "ttl", ttl)
    await this.redisClient.set(`socket:${sessionId}`, socketId, 'EX', ttl);
  
    console.log(`새 소켓 ID 저장 완료: ${socketId}, TTL: ${ttl}`);
  }
  
  // 예시로 간단한 소켓 ID 생성 방법
  private generateSocketId(): string {
    return Math.random().toString(36).substr(2, 9);  // 임의의 소켓 ID 생성
  }
}
