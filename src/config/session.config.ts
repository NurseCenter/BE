import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import getCookieOptions from 'src/auth/services/cookieOptions';
import { ConversionUtil } from 'src/common/utils/conversion.utils';

export class SessionConfigService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly configService: ConfigService,
  ) {}

  createSessionOptions() {
    const redisStore = new RedisStore({ client: this.redisClient });
    const cookieOptions = getCookieOptions();

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
