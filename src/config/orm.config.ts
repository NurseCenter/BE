import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const isLocal = configService.get<string>('NODE_ENV') === 'development';

  return {
    type: 'mysql',
    entities: [join(__dirname, '../**/*/*.entity.{ts,js}')],
    migrations: [join(__dirname, 'src', 'database', 'migrations', '*.{ts,js}')],
    migrationsTableName: 'migrations',
    host: configService.get<string>(isLocal ? 'LOCAL_DB_HOST' : 'AWS_DB_HOST'),
    port: configService.get<number>(isLocal ? 'LOCAL_DB_PORT' : 'AWS_DB_PORT'),
    username: configService.get<string>(isLocal ? 'LOCAL_DB_USERNAME' : 'AWS_DB_USERNAME'),
    password: configService.get<string>(isLocal ? 'LOCAL_DB_PASSWORD' : 'AWS_DB_PASSWORD'),
    database: configService.get<string>(isLocal ? 'LOCAL_DB_DATABASE' : 'AWS_DB_DATABASE'),
    synchronize: configService.get<boolean>('TYPEORM_SYNCHRONIZE'),
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
    version: '5.7',
  } as TypeOrmModuleOptions;
};
