import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';
import * as passport from 'passport';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { SessionConfigService } from './config/session.config';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import { ConfigModule } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// NODE_ENV 값에 따라 .env 파일을 다르게 읽음
dotenv.config({
  path: path.resolve(
    process.env.NODE_ENV === 'production'
      ? '.production.env' // 프로덕션(배포) 환경
      : '.development.env', // 로컬(개발) 환경
  ),
});

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

  // 스웨거 설정
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

  const devAllowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'https://localhost:3000',
  ];

  const prodAllowedOrigins = ['https://api.caugannie.com', 'https://www.caugannies.com', 'https://cauganies.com'];

  const allowedOrigins = process.env.NODE_ENV === 'development' ? devAllowedOrigins : prodAllowedOrigins;

  app.enableCors({
    origin: (origin, cb) => {
      if (allowedOrigins.includes(origin) || !origin) {
        cb(null, true);
      } else {
        cb(new Error('CORS에 의해 허용되지 않는 요청입니다.'));
      }
    },
    credentials: true,
  });

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
}
bootstrap();
