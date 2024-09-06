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
import { DatabaseExceptionFilter } from './filters/database-exception.filter';
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
    .setTitle('Your API Title')
    .setDescription('API description')
    .setVersion('1.0')
    .addTag('your-tag')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalFilters(new DatabaseExceptionFilter());

  // 환경변수 설정
  const sessionConfigService = app.get(SessionConfigService);
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
