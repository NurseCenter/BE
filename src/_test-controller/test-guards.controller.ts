import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegularMemberGuard, AdminGuard, SignInGuard } from 'src/auth/guards';

@ApiTags('Test')
@Controller('test-guards')
export class TestGuardsController {
  // 정회원 권한
  @Get('regular')
  @ApiOperation({ summary: '정회원 가드 테스트: 정회원인 경우만 메시지 조회 가능' })
  @UseGuards(RegularMemberGuard)
  getProtectedData() {
    return { message: '정회원만 가능합니다.' };
  }

  // 관리자 권한
  @Get('admin')
  @ApiOperation({ summary: '관리자 가드 테스트: 관리자인 경우만 메시지 조회 가능' })
  @UseGuards(AdminGuard)
  getAdminData() {
    return { message: '정회원만 가능합니다.' };
  }

  // 로그인 권한
  @Get('sign-in')
  @ApiOperation({ summary: '로그인 가드 테스트: 로그인한 상태인 경우만 메시지 조회 가능' })
  @UseGuards(SignInGuard)
  getSignInData() {
    return { message: '로그인해야 가능합니다.' };
  }
}
