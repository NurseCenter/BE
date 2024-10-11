import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { RedisModule } from 'src/common/redis.module';
import { SessionController } from './session.controller';
import { SessionGateway } from './session.gateway';

@Module({
  imports: [RedisModule],
  controllers: [SessionController],
  providers: [SessionService, SessionGateway],
  exports: [SessionService]
})
export class SessionModule {}
