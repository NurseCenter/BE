import { Body, Controller, InternalServerErrorException, Post } from '@nestjs/common';
import { KakaoMessageService } from './kakao-message.service';

@Controller('kakao-message')
export class KakaoMessageController {
  constructor(private readonly kakaoMessageService: KakaoMessageService) {}

  @Post('send')
  async sendMessage(@Body('message') message: string): Promise<void> {
    const code = process.env.KAKAO_CODE;

    if (!code || !message) {
      throw new InternalServerErrorException('코드와 메시지가 필요합니다.');
    }

    try {
      const accessToken = await this.kakaoMessageService.generateKakaoToken(code);
      await this.kakaoMessageService.sendMessageToAdmin(message, accessToken);
    } catch (error) {
      throw new InternalServerErrorException('메시지 전송 중 오류 발생');
    }
  }
}
