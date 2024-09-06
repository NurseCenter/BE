import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard, RegularMemberGuard, SignInGuard } from './guards';

@Controller('test-guard')
export class TestController {
  // 정회원 권한
  @Get('regular')
  @UseGuards(RegularMemberGuard)
  getProtectedData() {
    return { message: '정회원만 가능합니다.' };
  }

  // 관리자 권한
  @Get('admin')
  @UseGuards(AdminGuard)
  getAdminData() {
    return { message: '관리자만 가능합니다.' };
  }

  // 로그인 권한
  @Get('sign-in')
  @UseGuards(SignInGuard)
  getSignInData() {
    return { message: '로그인해야 가능합니다.' };
  }
}
