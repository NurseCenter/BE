import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join, resolve } from 'path';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions =>
  ({
    type: 'mysql',
    entities: [join(__dirname, '../**/*/*.entity.{ts,js}')],
    migrations: [join(__dirname, 'src', 'database', 'migrations', '*.{ts,js}')],
    migrationsTableName: 'migrations',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    synchronize: configService.get<boolean>('TYPEORM_SYNCHRONIZE'),
  }) as TypeOrmModuleOptions;
