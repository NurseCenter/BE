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

  // 클라이언트 연결 시 호출되는 메서드
  async handleConnection(client: Socket) {
    const cookies = client.handshake.headers?.cookie;
    const sessionId = extractSessionIdFromCookie(cookies);

    if (!sessionId) {
      console.error('세션 ID를 찾을 수 없습니다.');
      return;
    }

    client.join(sessionId);

    try {
      const existingSocketId = await this.getSocketIdFromRedis(sessionId);

      if (existingSocketId) {
        // 기존 소켓 ID가 있을 경우, 세션 만료 알림 준비
        await this.handleExistingSocket(sessionId, existingSocketId);
      } else {
        // 새 소켓이므로 Redis에 새 socket ID 저장
        await this.saveSocketIdToRedis(sessionId, client.id);
      }
    } catch (error) {
      console.error('세션 연결 처리 중 오류 발생:', error);
    }
  }

  // Redis에서 소켓 ID 가져오기
  private async getSocketIdFromRedis(sessionId: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.redisClient.get(`socket:${sessionId}`, (err, socketId) => {
        if (err) {
          reject(new Error('Redis에서 소켓 ID를 가져오는 중 오류 발생'));
        } else {
          resolve(socketId);
        }
      });
    });
  }

  // 기존 소켓으로 세션 만료 알림 전송
  private async handleExistingSocket(sessionId: string, existingSocketId: string) {
    const ttl = await this.redisClient.ttl(`session:${sessionId}`);

    if (ttl > 0) {
      const warningTime = ttl > 30 * 60 ? (ttl - 30 * 60) * 1000 : 0; // 30분 전

      if (warningTime > 0) {
        setTimeout(() => {
          this.sendSessionExpiryWarning(sessionId);
        }, warningTime);
      }

      // 기존 소켓에 알림 보내기
      const message = this.createSessionExpiryMessage();
      this.server.to(existingSocketId).emit('sessionExpiryWarning', { message });
    }
  }

  // 새 소켓 ID Redis에 저장
  private async saveSocketIdToRedis(sessionId: string, socketId: string) {
    await new Promise((resolve, reject) => {
      this.redisClient.set(`socket:${sessionId}`, socketId, 'EX', 7200, (err) => {
        if (err) reject(new Error('Redis에 소켓 ID 저장 실패'));
        else resolve(true);
      });
    });
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
  // 개발환경 : 로그인 후 30초 (만료: 1분)
  // 배포환경 : 1시간 30분 후 (만료: 2시간)
  private createSessionExpiryMessage(): string {
    return process.env.NODE_ENV === 'production'
      ? '세션이 30분 후 만료됩니다. 연장하시겠습니까?'
      : '세션이 10초 후 만료됩니다. 연장하시겠습니까?';
  }
}
