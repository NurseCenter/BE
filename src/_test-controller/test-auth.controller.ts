import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthPasswordService } from 'src/auth/services';

@ApiTags('Test')
@Controller('test-auth')
export class TestAuthController {
  constructor(private readonly authPasswordService: AuthPasswordService) {}

  // 해시화된 비밀번호 생성
  @Post('hash-password')
  @ApiOperation({ summary: '해시화된 비밀번호 생성' })
  @ApiBody({
    description: '해시화할 평문 비밀번호',
    type: String,
    required: true,
    schema: {
      example: { password: 'yourPlainPassword' },
    },
  })
  @ApiResponse({
    status: 200,
    description: '해시화된 비밀번호 반환',
    schema: {
      example: {
        hashedPassword: '$2b$15$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async hashPassword(@Body('password') plainPassword: string) {
    const hashedPassword = await this.authPasswordService.createHashedPassword(plainPassword);
    return { hashedPassword };
  }
}
