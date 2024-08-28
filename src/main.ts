import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';
import { SessionConfigService } from './config/session.config';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ConfigService 인스턴스 가져오기
  const sessionConfigService = app.get(SessionConfigService);

  // 인스턴스를 전달하여 sessionOptions 생성
  const sessionOptions = sessionConfigService.createSessionOptions();

  app.use(session(sessionOptions));
  app.use(cookieParser());
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(3000);
}
bootstrap();
