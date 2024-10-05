import { Module } from '@nestjs/common';
import { KakaoMessageService } from './kakao-message.service';
import { KakaoMessageController } from './kakao-message.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [KakaoMessageService],
  controllers: [KakaoMessageController],
})
export class KakaoMessageModule {}
