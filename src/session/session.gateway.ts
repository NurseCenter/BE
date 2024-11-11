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

  handleConnection(client: Socket) {
    // console.log('Handshake Headers: ', client.handshake.headers);

    // 쿠키에서 세션 ID 추출
    const cookies = client.handshake.headers?.cookie;
    const sessionId = extractSessionIdFromCookie(cookies);

    client.join(sessionId);

    // Redis에 세션 ID를 저장
    this.redisClient.set(`socket:${sessionId}`, client.id, 'EX', 7200);
  }

  handleDisconnect(client: Socket) {
    const sessionId = client.handshake.query.sessionId;
    this.redisClient.del(`socket:${sessionId}`);
  }

  sendSessionExpiryWarning(sessionId: string) {
    // Redis에서 소켓 ID를 가져와서, 소켓이 존재하면 알림을 보내야함.
    this.redisClient.get(`socket:${sessionId}`, (err, socketId) => {
      if (err) {
        console.error('Redis에서 소켓 ID를 가져오는 중 오류 발생:', err);
        return;
      }

      if (socketId) {
        const message =
          process.env.NODE_ENV === 'production'
            ? '세션이 30분 후 만료됩니다. 연장하시겠습니까?'
            : '세션이 10초 후 만료됩니다. 연장하시겠습니까?';

        this.server.to(socketId).emit('sessionExpiryWarning', { message });
      } else {
        console.log(`세션 ${sessionId}에 연결된 클라이언트가 없습니다.`);
      }
    });
  }

  async deleteSocket(sessionId: string): Promise<void> {
    const socketId = await this.redisClient.get(`socket:s%3A${encodeURIComponent(sessionId)}`);

    if (socketId) {
      const socket = this.server.sockets.sockets.get(socketId);

      if (socket) {
        socket.disconnect(true);
      }

      await this.redisClient.del(`socket:s%3A${sessionId}`);
    }
  }
}
