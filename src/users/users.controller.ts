import { Controller, Body, Post, Param, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 인증서류 이미지에서 실명 추출
  @Post('/:userId/name-extraction')
  @HttpCode(200)
  @ApiOperation({ summary: '인증서류 이미지에서 실명 추출' })
  @ApiResponse({
    status: 200,
    description: '실명 추출 및 회원 정보 업데이트 성공',
    schema: {
      example: {
        message: '실명 추출 및 회원 정보 업데이트 성공',
        userName: '김개똥',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: {
        statusCode: 400,
        message: '잘못된 요청입니다.',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '회원 또는 인증서류를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '회원 또는 인증서류를 찾을 수 없습니다.',
      },
    },
  })
  async postNameExtraction(@Param('userId') userId: number): Promise<{ message: string; userName: string }> {
    const userName = await this.usersService.extractUserName(userId);
    return { message: '실명 추출 및 회원 정보 업데이트 성공', userName };
  }

  @Post('check/nickname')
  @ApiOperation({ summary: '닉네임 중복 확인' })
  @ApiBody({
    schema: {
      example: {
        nickname: '명란젓코난',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '닉네임 사용 가능 여부',
    schema: {
      example: {
        available: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: {
        statusCode: 400,
        message: '잘못된 요청입니다.',
      },
    },
  })
  async checkNickname(@Body() body: { nickname: string }) {
    const available = await this.usersService.isNicknameAvailable(body.nickname);
    return { available };
  }

  @Post('check/email')
  @ApiOperation({ summary: '이메일 중복 확인' })
  @ApiBody({
    schema: {
      example: {
        email: 'lalala@example.com',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '이메일 사용 가능 여부',
    schema: {
      example: {
        available: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: {
        statusCode: 400,
        message: '잘못된 요청입니다.',
      },
    },
  })
  async checkEmail(@Body() body: { email: string }) {
    const available = await this.usersService.isEmailAvailable(body.email);
    return { available };
  }
}
