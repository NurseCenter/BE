import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';
import * as passport from 'passport';
import { SessionConfigService } from './config/session.config';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import AppDataSource from '../data-source';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DatabaseExceptionFilter } from './filters/database-exception.filter';

async function bootstrap() {
  ConfigModule.forRoot({ isGlobal: true });
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new DatabaseExceptionFilter());
  // ConfigService 인스턴스 가져오기
  const sessionConfigService = app.get(SessionConfigService);

  // 인스턴스를 전달하여 sessionOptions 생성
  const sessionOptions = sessionConfigService.createSessionOptions();

  app.use(session(sessionOptions));
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(cookieParser());

  app.setBaseViewsDir(join(__dirname, '..', 'src', 'views'));
  app.setViewEngine('ejs');

  app.enableCors();

  await app.listen(3000);
}
bootstrap();
