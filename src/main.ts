import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import AppDataSource from '../data-source';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  ConfigModule.forRoot({ isGlobal: true });
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(3000);
}
bootstrap();
