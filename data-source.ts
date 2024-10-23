import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

// TypeORM CLI와 직접 상호작용을 위해 사용
config(); // .env 파일에서 환경 변수를 불러옴.

const configService = new ConfigService();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: configService.get<string>(
    configService.get<string>('NODE_ENV') === 'development' ? 'LOCAL_DB_HOST' : 'AWS_DB_HOST'
  ),
  port: configService.get<number>(
    configService.get<string>('NODE_ENV') === 'development' ? 'LOCAL_DB_PORT' : 'AWS_DB_PORT'
  ),
  username: configService.get<string>(
    configService.get<string>('NODE_ENV') === 'development' ? 'LOCAL_DB_USERNAME' : 'AWS_DB_USERNAME'
  ),
  password: configService.get<string>(
    configService.get<string>('NODE_ENV') === 'development' ? 'LOCAL_DB_PASSWORD' : 'AWS_DB_PASSWORD'
  ),
  database: configService.get<string>(
    configService.get<string>('NODE_ENV') === 'development' ? 'LOCAL_DB_DATABASE' : ''
  ),
  logging: configService.get<boolean>('TYPEORM_LOGGING'),
  synchronize: configService.get<boolean>('TYPEORM_SYNCHRONIZE'),
  entities: [join(__dirname, 'src', '**', '*', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'src', 'database', 'migrations', '*.{ts,js}')],
  migrationsTableName: 'migrations',
});

export default AppDataSource;
