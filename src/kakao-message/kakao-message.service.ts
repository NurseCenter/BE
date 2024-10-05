import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class KakaoMessageService {
  private readonly KAKAO_TOKEN_API_URL: string;
  private readonly KAKAO_MESSAGE_API_URL: string;
  private readonly KAKAO_REST_API_KEY: string;

  constructor(private configService: ConfigService) {
    this.KAKAO_TOKEN_API_URL = this.configService.get<string>('KAKAO_TOKEN_API_URL');
    this.KAKAO_MESSAGE_API_URL = this.configService.get<string>('KAKAO_MESSAGE_API_URL');
    this.KAKAO_REST_API_KEY = this.configService.get<string>('KAKAO_REST_API_KEY');
  }

  // 카카오톡 나에게 메시지 전송은 잘 진행되지만 다음과 같은 문제가 있음.
  // env 파일에 넣는 code는 1회용임.
  // 이 코드는 사용자가 카카오 로그인 동의 화면 이후 URL로 전달하는 Authorization Code를 추출하여 환경변수에 넣고 있음.
  // -> 해결 필요함.
  async generateKakaoToken(code: string): Promise<string> {
    const data = {
      grant_type: 'authorization_code',
      client_id: this.KAKAO_REST_API_KEY,
      redirect_uri: 'https://localhost:3000',
      code: code,
    };

    const headers = {
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    };

    try {
      const response = await axios.post(this.KAKAO_TOKEN_API_URL, data, { headers });
      return response.data.access_token;
    } catch (error) {
      console.error('토큰 발급 오류:', error.response.data);
      throw new InternalServerErrorException('토큰 발급 실패');
    }
  }

  async sendMessageToAdmin(message: string, accessToken: string): Promise<void> {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    };

    const templateObject = {
      object_type: 'text',
      text: message,
      link: {
        web_url: 'https://www.caugannies.com',
      },
    };

    // template_object를 JSON 문자열로 변환하고 URL 인코딩
    const templateObjectStr = encodeURIComponent(JSON.stringify(templateObject));

    const finalData = `template_object=${templateObjectStr}`;

    try {
      await axios.post(this.KAKAO_MESSAGE_API_URL, finalData, { headers });
    } catch (error) {
      console.error('메시지 전송 오류:', error.response.data);
      throw new InternalServerErrorException('메시지 전송 실패');
    }
  }
}
