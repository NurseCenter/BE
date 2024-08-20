import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function ormConfig(configService: ConfigService): TypeOrmModuleOptions {
  console.log(configService.get<boolean>('TYPEORM_SYNCHRONIZE'));
  return {
    type: 'mysql',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    synchronize: configService.get<boolean>('TYPEORM_SYNCHRONIZE') || false, // 애플리케이션 실행 시 자동으로 스키마를 동기화하지 않도록 설정
    entities: [__dirname + '/../**/*.entity.{js,ts}'], // 엔티티 파일 경로
    migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'], // 마이그레이션 파일 경로
    migrationsTableName: 'migrations', // 마이그레이션을 기록할 테이블 이름
    logging: configService.get<boolean>('TYPEORM_LOGGING') || true, // 로그 설정
  };
}
