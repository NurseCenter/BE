import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import { sendCookieOptions } from 'src/auth/services';
import { ConversionUtil } from 'src/common/utils/conversion.utils';

export class SessionConfigService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly configService: ConfigService,
  ) {}

  createSessionOptions(autoLogin: boolean) {
    const redisStore = new RedisStore({ client: this.redisClient });

    const isProduction = process.env.NODE_ENV === 'production';

    const cookieOptions = {
      ...sendCookieOptions(),
      maxAge: autoLogin
        ? 14 * 24 * 60 * 60 * 1000 // 자동 로그인 기한: 2주
        : isProduction
          ? 2 * 60 * 60 * 1000 // 배포 환경: 2시간
          : 24 * 60 * 60 * 1000, // 로컬 환경: 24시간
    };

    return {
      store: redisStore,
      secret: this.configService.get<string>('SESSION_SECRET') || 'gannies_session_default',
      resave: ConversionUtil.stringToBoolean(this.configService.get<string>('SESSION_RESAVE')) || false,
      saveUninitialized:
        ConversionUtil.stringToBoolean(this.configService.get<string>('SESSION_SAVE_UNINITIALIZED')) || false,
      cookie: cookieOptions,
    };
  }
}
