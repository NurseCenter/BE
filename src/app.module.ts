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
import { OcrsController } from './ocrs/ocrs.controller';

@Module({
  imports: [AuthModule, HospitalsModule, PostsModule, CommentsModule, UsersModule, AdminModule, CommonModule, ConfigModule, ScrapModule, LikesModule, OcrModule],
  controllers: [AppController, OcrsController],
  providers: [AppService],
})
export class AppModule {}
