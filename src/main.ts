import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';

async function bootstrap() {
  ConfigModule.forRoot({ isGlobal: true });

  const sessionOptions = {
    secret: 'my-secret',
    resave: false,
    saveUninitialized: false,
  }
  
  const app = await NestFactory.create(AppModule);

  app.use(
    session(sessionOptions));
  app.use(cookieParser());

  await app.listen(3000);
}
bootstrap();
