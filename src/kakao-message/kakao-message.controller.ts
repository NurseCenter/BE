import { Body, Controller, InternalServerErrorException, Post } from '@nestjs/common';
import { KakaoMessageService } from './kakao-message.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/*
미완성 사유: 카카오 액세스토큰을 생성하기 위해서는 리다이렉트 URI를 통해 브라우저에서 코드를 발급받아야 함. 이 과정에서 URL에 포함된 코드가 필요한데, 해당 코드는 1회용으로 설계되어 있어 매번 새로운 코드를 발급받아야 함. 
그러나 메시지 전송 기능은 서버 간의 통신으로 이루어지며, 브라우저 페이지가 없기 때문에 직접적으로 사용자와 상호작용할 수 없음.

소셜 로그인과 같은 경우, 사용자가 브라우저를 통해 리다이렉트되고 URL에 포함된 토큰을 추출할 수 있지만, 현재 구현에서는 브라우저 없이 카카오톡 API를 사용하여 서버에서 직접 메시지를 발송해야 하는 상황임. 
이 문제를 해결하기 위해서는 액세스토큰을 효율적으로 관리하고, 필요할 때마다 새로운 코드를 발급받을 수 있는 방법을 모색해야함.
예를 들어, 서버에서 주기적으로 액세스토큰을 갱신하는 방식이 필요할 것인데, 이를 어떻게 구현해야할지 모르겠음.
*/

@ApiTags('Kakao Message')
@Controller('kakao-message')
export class KakaoMessageController {
  constructor(private readonly kakaoMessageService: KakaoMessageService) {}

  @Post('send')
  @ApiOperation({ summary: '카카오 메시지 전송 (개발중)' })
  @ApiResponse({ status: 200, description: '메시지가 성공적으로 전송되었습니다.' })
  @ApiResponse({ status: 500, description: '메시지 전송 중 오류 발생' })
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
