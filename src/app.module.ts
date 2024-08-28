import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HospitalsModule } from './hospitals/hospitals.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { CommonModule } from './common/common.module';
import { ScrapModule } from './scraps/scraps.module';
import { LikesModule } from './likes/likes.module';
import { OcrModule } from './ocr/ocr.module';
import { OcrController } from './ocr/ocr.controller';
import { SearchModule } from './search/search.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getTypeOrmConfig } from './config/orm.config';
import { RedisModule } from './common/redis.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { SessionConfigService } from './config/session.config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TwilioModule } from 'nestjs-twilio';
import { getTwilioConfig } from './config/twilio.config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getTypeOrmConfig(configService),
      inject: [ConfigService],
    }),
    AuthModule,
    HospitalsModule,
    PostsModule,
    CommentsModule,
    UsersModule,
    AdminModule,
    CommonModule,
    ConfigModule,
    ScrapModule,
    LikesModule,
    OcrModule,
    SearchModule,
    RedisModule,
    HealthCheckModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public')
    }),
    TwilioModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>({
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        // accountSid: configService.get<string>('TWILIO_ACCOUNT_SID'),
        // authToken: configService.get<string>('TWILIO_AUTH_TOKEN'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController, OcrController],
  providers: [AppService, SessionConfigService],
})
export class AppModule {}
