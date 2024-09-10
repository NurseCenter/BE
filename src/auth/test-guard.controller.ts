import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard, RegularMemberGuard, SignInGuard } from './guards';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Test Guard')
@Controller('test-guard')
export class TestController {
  // 정회원 권한
  @ApiOperation({ summary: '정회원 전용 데이터 접근' })
  @ApiResponse({ status: 200, description: '정회원만 접근할 수 있는 데이터' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  @UseGuards(RegularMemberGuard)
  @Get('regular')
  getProtectedData() {
    return { message: '정회원만 가능합니다.' };
  }

  // 관리자 권한
  @ApiOperation({ summary: '관리자 전용 데이터 접근' })
  @ApiResponse({ status: 200, description: '관리자만 접근할 수 있는 데이터' })
  @ApiResponse({ status: 401, description: '권한 없음' })
  @UseGuards(AdminGuard)
  @Get('admin')
  getAdminData() {
    return { message: '관리자만 가능합니다.' };
  }

  // 로그인 권한
  @ApiOperation({ summary: '로그인 사용자 전용 데이터 접근' })
  @ApiResponse({ status: 200, description: '로그인한 사용자만 접근할 수 있는 데이터' })
  @ApiResponse({ status: 401, description: '로그인 필요' })
  @UseGuards(SignInGuard)
  @Get('sign-in')
  getSignInData() {
    return { message: '로그인해야 가능합니다.' };
  }
}
