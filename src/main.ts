import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import AppDataSource from '../data-source';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // await AppDataSource.initialize();
  const configService = new ConfigService();

  // await AppDataSource.synchronize();
  await app.listen(3000);
}
bootstrap();
