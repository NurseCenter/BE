import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { CommonModule } from './common/common.module';
import { ScrapModule } from './scraps/scraps.module';
import { LikesModule } from './likes/likes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getTypeOrmConfig } from './config/orm.config';
import { RepliesModule } from './replies/replies.module';
import { RedisModule } from './common/redis.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { SessionConfigService } from './config/session.config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getTypeOrmConfig(configService),
      inject: [ConfigService],
    }),
    AuthModule,
    PostsModule,
    CommentsModule,
    UsersModule,
    AdminModule,
    CommonModule,
    ConfigModule,
    ScrapModule,
    LikesModule,
    RepliesModule,
    RedisModule,
    HealthCheckModule,
    ImagesModule,
  ],
  controllers: [AppController],
  providers: [AppService, SessionConfigService],
})
export class AppModule {}
