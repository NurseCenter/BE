import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import AppDataSource from '../data-source';
import { ConfigModule, ConfigService } from '@nestjs/config';

async function bootstrap() {
  ConfigModule.forRoot({ isGlobal: true });
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
