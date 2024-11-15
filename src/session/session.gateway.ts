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

  private socketsMap = new Map<string, Socket>();

  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

//   // 클라이언트 연결 시 세션 ID 추출 및 TTL 동기화
//   async handleConnection(client: Socket) {
//     const cookies = client.handshake.headers?.cookie;
//     const sessionId = extractSessionIdFromCookie(cookies);

//     if (!sessionId) {
//       console.error('세션 ID를 찾을 수 없습니다.');
//       return;
//     }

//     client.join(sessionId);

//     try {
//       // 세션 만료 시간 가져오기
//       const sessionTTL = await this.redisClient.ttl(`session:${sessionId}`);
//       if (sessionTTL > 0) {
//         // 기존 세션 TTL로 소켓 TTL을 설정
//         await this.redisClient.set(`socket:s%3A${sessionId}`, client.id, 'EX', sessionTTL)
//       } else {
//         // TTL 만료시 소켓 종료
//         this.sendSessionExpiryWarning(client);
//         client.disconnect(true);
//         return;
//       }
//     } catch (error) {
//       console.error('세션 연결 처리 중 오류 발생:', error);
//       client.disconnect();
//     }
//   }

//   // 클라이언트 연결 종료 시 소켓 ID 삭제
//   async handleDisconnect(client: Socket) {
//     const sessionId = extractSessionIdFromCookie(client.handshake.headers?.cookie);
//     if (sessionId) {
//       try {
//         // 소켓 ID 삭제
//         await this.redisClient.del(`socket:s%3A${sessionId}`);
//       } catch (error) {
//         console.error(`세션 ${sessionId}의 소켓 ID 삭제 중 오류 발생:`, error);
//       }
//     }
//   }

//   // // 세션 만료 알림 전송
//   // sendSessionExpiryWarning(sessionId: string) {
//   //   this.redisClient.get(`socket:${sessionId}`, (err, socketId) => {
//   //     if (err) {
//   //       console.error('Redis에서 소켓 ID를 가져오는 중 오류 발생:', err);
//   //       return;
//   //     }

//   //     if (socketId) {
//   //       const message = this.createSessionExpiryMessage();
//   //       this.server.to(socketId).emit('sessionExpiryWarning', { message });
//   //     } else {
//   //       console.log(`세션 ${sessionId}에 연결된 클라이언트가 없습니다.`);
//   //     }
//   //   });
//   // }

//     // 세션 만료 알림 전송
//     sendSessionExpiryWarning(client: Socket) {
//       const message = this.createSessionExpiryMessage();
//       client.emit('sessionExpiryWarning', { message });
//     }

//   // 세션 강제 종료
//   async deleteSocket(sessionId: string): Promise<void> {
//     const socketId = await this.redisClient.get(`socket:${sessionId}`);

//     if (socketId) {
//       const socket = this.server.sockets.sockets.get(socketId);
//       if (socket) {
//         socket.disconnect(true);
//       }
//       await this.redisClient.del(`socket:${sessionId}`);
//     }
//   }

//   // 세션 만료 메시지 생성
//   // 개발환경 : 만료 1분 전
//   // 배포환경 : 만료 30분 전
//   private createSessionExpiryMessage(): string {
//     return process.env.NODE_ENV === 'production'
//       ? '세션이 30분 후 만료됩니다. 연장하시겠습니까?'
//       : '세션이 1분 후 만료됩니다. 연장하시겠습니까?';
//   }
// }

  /**
   * 클라이언트 연결 시 세션 ID 추출 및 TTL 동기화
   * @param client 클라이언트 소켓
   */
  async handleConnection(client: Socket): Promise<void> {
    const cookies = client.handshake.headers?.cookie;
    const sessionId = extractSessionIdFromCookie(cookies);

    if (!sessionId) {
      console.error('세션 ID를 찾을 수 없습니다.');
      client.disconnect();
      return;
    }

    client.join(sessionId); // 세션 ID로 방에 가입

    try {
      // 세션 TTL 확인
      const sessionTTL = await this.redisClient.ttl(`session:${sessionId}`);
      if (sessionTTL > 0) {
        await this.redisClient.set(`socket:s%3A${sessionId}`, client.id, 'EX', sessionTTL);
        this.socketsMap.set(sessionId, client); // Socket 저장
      } else {
        // TTL 만료 시 알림 보내고 연결 종료
        this.sendSessionExpiryWarning(client);
        client.disconnect(true);
      }
    } catch (error) {
      console.error('세션 연결 처리 중 오류 발생:', error);
      client.disconnect();
    }
  }

  /**
   * 클라이언트 연결 종료 시 소켓 ID 삭제
   * @param client 클라이언트 소켓
   */
  async handleDisconnect(client: Socket): Promise<void> {
    const sessionId = extractSessionIdFromCookie(client.handshake.headers?.cookie);
    if (sessionId) {
      try {
        await this.redisClient.del(`socket:s%3A${sessionId}`); // Redis에서 소켓 ID 삭제
        this.socketsMap.delete(sessionId); // Map에서 소켓 삭제
      } catch (error) {
        console.error(`세션 ${sessionId}의 소켓 ID 삭제 중 오류 발생:`, error);
      }
    }
  }

  /**
   * 세션 ID에 해당하는 Socket 객체를 찾는 메서드
   * @param sessionId 세션 ID
   * @returns 해당 세션에 연결된 Socket 객체
   */
  getSocketBySessionId(sessionId: string): Socket | undefined {
    return this.socketsMap.get(sessionId);
  }

  /**
   * 세션 만료 알림 전송
   * @param client 클라이언트 소켓
   */
  sendSessionExpiryWarning(client: Socket): void {
    const message = this.createSessionExpiryMessage();
    client.emit('sessionExpiryWarning', { message });
  }

  /**
   * 세션 만료 메시지 생성 (환경에 따라 다르게 메시지 생성)
   * @returns 세션 만료 메시지
   */
  private createSessionExpiryMessage(): string {
    return process.env.NODE_ENV === 'production'
      ? '세션이 30분 후 만료됩니다. 연장하시겠습니까?'
      : '세션이 1분 후 만료됩니다. 연장하시겠습니까?';
  }

  /**
   * 세션 강제 종료
   * @param sessionId 세션 ID
   */
  async deleteSocket(sessionId: string): Promise<void> {
    const socketId = await this.redisClient.get(`socket:${sessionId}`);

    if (socketId) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit('sessionExpired', { message: '세션이 만료되어 연결이 종료됩니다.' });
        socket.disconnect(true); // 소켓 연결 종료
      }
      await this.redisClient.del(`socket:${sessionId}`);
    }
  }
}