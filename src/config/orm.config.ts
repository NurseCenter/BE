import { TypeOrmModuleOptions } from '@nestjs/typeorm';

function ormConfig(): TypeOrmModuleOptions {
  const commonConf = {
    SYNCHRONIZE: false, // 데이터베이스 스키마를 자동으로 동기화할지 여부
    ENTITIES: [__dirname + '/../entities/*{.ts,.js}'], // 엔티티 파일 경로 (TS 또는 JS 확장자를 가진 파일)
    MIGRATIONS: [__dirname + '/../migrations/**/*{.ts,.js}'], // // 마이그레이션 파일 경로
    MIGRATIONS_RUN: false, // 애플리케이션 실행 시 자동으로 마이그레이션을 적용할지 여부
  };

  return {
    name: 'Gannies',
    type: 'mysql',
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    logging: process.env.TYPEORM_LOGGING === 'true',
    synchronize: commonConf.SYNCHRONIZE,
    entities: commonConf.ENTITIES,
    migrations: commonConf.MIGRATIONS,
    migrationsRun: commonConf.MIGRATIONS_RUN,
  };
}

export { ormConfig };
