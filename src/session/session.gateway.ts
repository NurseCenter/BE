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
    console.log("소켓 연결됨", client.id);
    console.log("Handshake Headers: ", client.handshake.headers);
    
    // 쿠키에서 세션 ID 추출
    const cookies = client.handshake.headers?.cookie;
    const sessionId = extractSessionIdFromCookie(cookies);
    
    console.log("소켓의 쿠키 sessionId", sessionId);
    
    client.join(sessionId);
  
    // Redis에 세션 ID를 저장
    this.redisClient.set(`socket:${sessionId}`, client.id, 'EX', 7200);
  }

  handleDisconnect(client: Socket) {
    const sessionId = client.handshake.query.sessionId;
    this.redisClient.del(`socket:${sessionId}`);
  }

  sendSessionExpiryWarning(sessionId: string) {
    this.server.to(sessionId).emit('sessionExpiryWarning', { message: '세션이 30분 후 만료됩니다. 연장하시겠습니까?' });
  }
}
