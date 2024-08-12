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
import { ConfigModule } from './config/config.module';
import { ScrapModule } from './scrap/scrap.module';
import { LikesModule } from './likes/likes.module';
import { OcrModule } from './ocr/ocr.module';
import { OcrController } from './ocr/ocr.controller';
import { SearchModule } from './search/search.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from './config/orm.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useFactory: ormConfig }),
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
  ],
  controllers: [AppController, OcrController],
  providers: [AppService],
})
export class AppModule {}
