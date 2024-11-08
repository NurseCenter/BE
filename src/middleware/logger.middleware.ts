import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import Redis from 'ioredis';
import { ConversionUtil, extractSessionIdFromCookie } from 'src/common/utils';
import { winstonLogger } from 'src/config/logger.config';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent');
    const userIdInRequest = req?.session?.passport?.user?.userId;
    const cookie = req?.headers?.cookie;

    // 쿠키 필요한 서비스들은 설정
    if (!cookie) {
      winstonLogger.error('Request header의 쿠키가 없습니다.');
      throw new Error('Request header의 쿠키가 없습니다.');
    }

    if (!userIdInRequest) {
      winstonLogger.error('Request에서 userId가 없습니다.');
      return next(new Error('Request에서 userId가 없습니다.'));
    }

    const sessionId = decodeURIComponent(extractSessionIdFromCookie(cookie));

    try {
      const userString = await this.redisClient.get(`sess:${sessionId}`);

      if (!userString) {
        winstonLogger.error('Redis에서 사용자 정보를 찾을 수 없습니다.');
        return next(new Error('Redis에서 사용자 정보를 찾을 수 없습니다.'));
      }

      const userData = JSON.parse(userString);
      if (!userData.passport || !userData.passport.user) {
        winstonLogger.error('Redis에서 반환된 데이터의 구조가 잘못되었습니다.');
        return next(new Error('Redis에서 반환된 데이터의 구조가 잘못되었습니다.'));
      }

      const userIdInRedis = userData.passport.user.userId;
      const datetime = new Date(); // 현재 날짜

      if (userIdInRedis !== userIdInRequest) {
        winstonLogger.error('Request가 비정상적입니다.');
        return next(new Error('Request가 비정상적입니다.'));
      }

      const dateTimeToKST = ConversionUtil.toKST(datetime);

      res.on('finish', () => {
        const { statusCode } = res;
        winstonLogger.log(
          `[Gannies] ${dateTimeToKST} USER-${userIdInRedis} ${method} ${originalUrl} ${statusCode} ${ip} ${userAgent}`,
        );
      });

      next();
    } catch (error) {
      winstonLogger.error(`에러 발생: ${error.message}`);
      next(error);
    }
  }
}
