import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  CreateUserDto,
  FindEmailDto,
  FindPasswordDto,
  SendPhoneVerificationDto,
  SignInUserDto,
  VerifyEmailDto,
  VerifyPhoneNumberDto,
} from './dto';
import { SessionUser } from './decorators/get-user.decorator';
import { IUserWithoutPassword } from './interfaces';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 회원가입
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({ type: CreateUserDto, description: '회원가입에 필요한 정보' })
  @ApiResponse({ status: 201, description: '회원가입이 성공적으로 완료되었습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async postSignUp(@Body() createUserDto: CreateUserDto): Promise<{ message: string; userId: number }> {
    const userId = await this.authService.signUp(createUserDto);
    return { message: '회원가입이 성공적으로 완료되었습니다.', userId };
  }

  // 회원탈퇴
  @Delete('withdrawal')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '회원탈퇴' })
  @ApiResponse({ status: 204, description: '회원탈퇴가 성공적으로 완료되었습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async deleteWithdrawal(@SessionUser() sessionUser: IUserWithoutPassword): Promise<{ message: string }> {
    const { userId } = sessionUser;
    await this.authService.withDraw(userId);
    return { message: '회원탈퇴가 성공적으로 완료되었습니다.' };
  }

  // 로그인
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인' })
  @ApiBody({ type: SignInUserDto, description: '로그인에 필요한 정보' })
  @ApiResponse({ status: 200, description: '로그인에 성공하였습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async postSignIn(
    @Body() signInUserDto: SignInUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<{ message: string }> {
    await this.authService.signIn(signInUserDto, req, res);
    return { message: '로그인이 완료되었습니다.' };
  }

  // 로그아웃
  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃에 성공하였습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async postSignOut(@Req() req: Request, @Res() res: Response): Promise<{ message: string }> {
    await this.authService.signOut(req, res);
    return { message: '로그아웃이 완료되었습니다.' };
  }

  // 이메일 인증 발송
  @Post('sign-up/email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일 인증 발송' })
  @ApiBody({ type: VerifyEmailDto, description: '이메일 인증을 위한 정보' })
  @ApiResponse({ status: 200, description: '회원가입 인증용 이메일을 발송하였습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async postSignUpEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
    await this.authService.sendVerificationEmail(verifyEmailDto);
    return { message: '회원가입 인증용 이메일을 발송하였습니다.' };
  }

  // 이메일 인증 확인
  @Post('sign-up/email-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일 인증 확인' })
  @ApiBody({ type: Object, description: '이메일 인증 토큰' })
  @ApiResponse({ status: 200, description: '이메일 인증에 성공하였습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async postSignUpEmailVerification(@Body() body: { token: string }): Promise<{ message: string }> {
    const { token } = body;
    await this.authService.verifyEmail(token);
    return { message: '이메일 인증에 성공하였습니다.' };
  }

  // 이메일 찾기
  @Post('email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일 찾기' })
  @ApiQuery({ name: 'email', type: FindEmailDto, description: '이메일 찾기에 필요한 정보' })
  @ApiResponse({ status: 200, description: '이메일 찾기가 성공하였습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async getEmail(@Body() findEmailDto: FindEmailDto) {
    const email = await this.authService.findEmail(findEmailDto);
    return { message: '이메일 찾기가 성공하였습니다.', email };
  }

  // 비밀번호 찾기 (임시 비밀번호 발급)
  @Post('password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '비밀번호 찾기' })
  @ApiQuery({ name: 'password', type: FindPasswordDto, description: '비밀번호 찾기에 필요한 정보' })
  @ApiResponse({ status: 200, description: '임시 비밀번호 발급이 성공하였습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async getPassword(@Body() findPasswordDto: FindPasswordDto) {
    await this.authService.findPassword(findPasswordDto);
    return { message: '임시 비밀번호 발급이 성공하였습니다.' };
  }

  // 휴대폰 인증번호 발급
  @Post('phone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '휴대폰 인증번호 발급' })
  @ApiBody({ type: SendPhoneVerificationDto, description: '휴대폰 인증번호 발급을 위한 정보' })
  @ApiResponse({ status: 200, description: '휴대폰 인증번호가 발급되었습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async postPhoneVerificationCode(@Body() sendPhoneVerificationDto: SendPhoneVerificationDto) {
    const { phoneNumber } = sendPhoneVerificationDto;
    await this.authService.sendPhoneVerificationCode(phoneNumber);
    return { message: '휴대폰 인증번호가 발급되었습니다.' };
  }

  // 휴대폰 인증번호 발급 확인
  @Post('phone-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '휴대폰 인증번호 발급 확인' })
  @ApiBody({ type: VerifyPhoneNumberDto, description: '휴대폰 인증번호 확인을 위한 정보' })
  @ApiResponse({ status: 200, description: '휴대폰 인증이 성공하였습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async postPhoneVerificationConfirm(verifyPhoneNumberDto: VerifyPhoneNumberDto) {
    const { phoneNumber, code } = verifyPhoneNumberDto;
    await this.authService.verifyPhoneNumberCode(phoneNumber, code);
    return { message: '휴대폰 인증이 성공하였습니다.' };
  }

  // 사용자 상태 확인
  // 프론트엔드의 리다이렉션을 위함.
  @Get('status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '회원 상태 확인' })
  @ApiResponse({
    status: 200,
    description: '사용자 상태 확인 성공',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['non_member', 'pending_verification', 'email_verified', 'approved_member', 'error'],
          example: 'non_member',
        },
        message: {
          type: 'string',
          example: '회원가입 폼이 제출되었습니다. 인증 절차를 진행해 주세요.',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async getStatus(
    @SessionUser() sessionUser: IUserWithoutPassword,
    @Res() res: Response,
  ): Promise<{ message: string }> {
    const { userId } = sessionUser;
    return await this.authService.sendStatus(userId);
  }
}
