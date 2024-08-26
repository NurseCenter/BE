import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { createSessionOptions } from './config/session.config';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ConfigService 인스턴스 가져오기
  const configService = app.get(ConfigService);

  // 인스턴스를 전달하여 sessionOptions 생성
  const sessionOptions = createSessionOptions(configService);

  app.use(
    session(sessionOptions));
    
  app.use(cookieParser());

  await app.listen(3000);
}
bootstrap();
