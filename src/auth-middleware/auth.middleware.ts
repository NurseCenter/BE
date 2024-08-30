// import { Injectable, NestMiddleware } from '@nestjs/common';
// import { createClient } from 'redis';

// const redisClient = createClient();

// @Injectable()
// export class AuthMiddleware implements NestMiddleware {
//   use(req: any, res: any, next: () => void) {

//     const cookie = req.headers.cookies

//     if (cookie) {
//       const sessionId = cookie['connectsid']
//     } else {
//       return null;
//     }

//     next();
//   }

//   private extractSessionId(cookie: string | undefined): string | null {
//     // 쿠키에서 sessionId 추출
//     if (!cookie) return null;
//     const sessionId = cookie['connectsid']
//     return sessionId
//   }

//   private async findUserIdFromSession(sessionId: string): Promise<number | null> {
//     //redis에서 세션 ID로 사용자 ID 검색
//     try {
//       const sessionData = await redisClient.get(`session:${sessionId}`);
      
//       if (sessionData) {
//         const session = JSON.parse(sessionData)
//         return session.userId;
//       }
//     } catch (error) {
//       console.error("Redis에서 세션을 가져오는 중 에러가 발생하였습니다.", error);
//     }
//   }
//   private async findUserFromDatabase(userId: number): Promise<any> {
//     // 사용자 정보를 데이터베이스에서 조회
//     return this.userRepository.findOne({ userId })
//   }
// }
