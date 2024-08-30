import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';

export class SessionConfigService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly configService: ConfigService,
  ) {}

  createSessionOptions() {
    // connect-redis를 사용하여 Redis 저장소 생성
    const redisStore = new RedisStore({ client: this.redisClient });

    return {
      store: redisStore,
      secret: this.configService.get<string>('SESSION_SECRET') || 'gannies_session_default',
      resave: this.configService.get<boolean>('SESSION_RESAVE') || false,
      saveUninitialized: this.configService.get<boolean>('SESSION_SAVE_UNINITIALIZED'),
      cookie: {  maxAge: 24 * 60 * 60 * 1000 }
      // 쿠키 옵션은 일단 로그인 되는 거 확인하고 쓰자.
    };
  }
}
