import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { UsersEntity } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';

// 미들웨어는 사용자 인증 정보를 req.user에 설정
@Injectable()
export class AuthMiddleware implements NestMiddleware {
constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    @InjectRepository(UsersEntity) private readonly userRepository: Repository<UsersEntity>,
    ) {}

  async use(req: any, res: any, next: () => void) {
    try {
      const cookie = req.headers.cookie;
      if (cookie) {
        const sessionId = this.extractSessionId(cookie);
        if (sessionId) {
          const userId = await this.findUserIdFromSession(sessionId);
          if (userId) {
            const user = await this.findUserFromDatabase(userId);
            if (user) {
              req.user = {
                id: user.userId, // 회원 ID
                membershipStatus: user.membershipStatus, // 회원 상태
                isAdmin: user.isAdmin,  // 관리자 여부
              };
            } else {
              req.user = {}; // 사용자 정보가 없는 경우 빈 객체 설정
            }
          } else {
            req.user = {}; // 세션 ID로 사용자 ID를 찾을 수 없는 경우 빈 객체 설정
          }
        } else {
          req.user = {}; // 세션 ID가 없는 경우 빈 객체 설정
        }
      } else {
        req.user = {}; // 쿠키가 없는 경우 빈 객체 설정
      }
    } catch (error) {
      console.error('AuthMiddleware error:', error);
      req.user = {}; // 오류 발생 시 빈 객체 설정
    } finally {
      next(); // 미들웨어 작업 후 요청을 계속 진행
    }
  }

  // 쿠키에서 sessionId 추출
  private extractSessionId(cookie: string | undefined): string | null {
    if (!cookie) return null;
    const match = cookie.match(/connect.sid=([^;]+)/);
    return match ? match[1] : null;
  }

  // redis에서 세션 ID로 사용자 ID 검색
  // 실행 중 오류가 나면 기록하고, 정보 못 찾으면 null 반환
  private async findUserIdFromSession(sessionId: string): Promise<number | null> {
    try {
      const sessionData = await this.redisClient.get(`session:${sessionId}`);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        return session.userId;
      }
    } catch (error) {
      console.error('Error retrieving session from Redis:', error);
    }
    return null;
  }

  // 사용자 정보를 데이터베이스에서 조회
  private async findUserFromDatabase(userId: number): Promise<UsersEntity | null> {
    try {
      return await this.userRepository.findOne({ where: { userId } });
    } catch (error) {
      console.error('Error retrieving user from database:', error);
    }
    return null;
  }
}