import { Inject, Injectable } from "@nestjs/common";
import { randomBytes } from "crypto";
import getCookieOptions from "./cookieOptions";
import Redis from 'ioredis';
import { Response } from 'express';
import { async } from "rxjs";

@Injectable()
export class AuthSessionService {
    constructor(
        @Inject('REDIS_CLIENT') private readonly redisClient: Redis
      ) {}

    // 세션 ID 생성하기
    async generateSessionId(): Promise<string> {
        return randomBytes(32).toString('hex');
    }

    // 세션 ID에서 사용자 ID 찾기
    async getUserIdFromSession(sessionId: string): Promise<string | null> {
        const userIdInRedis = await this.redisClient.hmget(`sessionId:${sessionId}`, 'userId')
        const userId = userIdInRedis[0] || null;
        return userId;
    }

    // 쿠키 생성하기
    async sendCookie(res: Response, sessionId: string) {
        const returnedCookieOptions = await getCookieOptions();
        res.cookie('sessionId', sessionId, returnedCookieOptions);
    }
}