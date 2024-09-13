import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';
import * as passport from 'passport';
import { SessionConfigService } from './config/session.config';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import { ConfigModule } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  //스웨거 설정
  const config = new DocumentBuilder()
    .setTitle('Gannies API Document')
    .setDescription('중간이들 백엔드 API description')
    .setVersion('1.0')
    .addTag('Gannies')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalFilters(new DatabaseExceptionFilter());

  // 환경변수 설정
  const sessionConfigService = app.get(SessionConfigService);
  const sessionOptions = sessionConfigService.createSessionOptions();

  app.use(cookieParser());
  app.use(session(sessionOptions));
  app.use(passport.initialize());
  app.use(passport.session());

  app.setBaseViewsDir(join(__dirname, '..', 'src', 'views'));
  app.setViewEngine('ejs');

  app.enableCors({
    origin: (origin, cb) => {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        'http://localhost:3000',
        'http://127.0.0.1:5500', // 이메일 인증 확인용
        'http://localhost:3001', // 로그인/로그아웃 확인용
      ];

      if (allowedOrigins.includes(origin) || !origin) {
        cb(null, true);
      } else {
        cb(new Error('CORS에 의해 허용되지 않는 요청입니다.'));
      }
    },
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
