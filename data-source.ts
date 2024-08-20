import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { resolve } from 'path';

// TypeORM CLI와 직접 상호작용을 위해 사용
config(); // .env 파일에서 환경 변수를 불러옴.

const configService = new ConfigService();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  logging: true,
  synchronize: configService.get<boolean>('TYPEORM_SYNCHRONIZE'), // || false, // 애플리케이션 실행 시 자동으로 스키마를 동기화하지 않도록 설정
  entities: [resolve(__dirname), '../src/**/*/entities/*.{ts,js}'], // 엔티티 파일 경로
  migrations: [resolve(__dirname), './src/database/migrations/*{.ts,.js}'], // 마이그레이션 파일 경로
  migrationsTableName: 'migrations', // 마이그레이션을 기록할 테이블 이름
});

export default AppDataSource;
