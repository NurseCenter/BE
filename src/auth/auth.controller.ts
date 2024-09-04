import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto, FindEmailDto, FindPasswordDto, SendPhoneVerificationDto, SignInUserDto, VerifyEmailDto, VerifyPhoneNumberDto } from './dto';
import { SessionUser } from './decorators/get-user.decorator';
import { IUserWithoutPassword } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 회원가입
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async postSignUp(@Body() createUserDto: CreateUserDto): Promise<{ message: string }> {
    await this.authService.signUp(createUserDto);
    return { message: '회원가입이 성공적으로 완료되었습니다.' };
  }

  // 회원탈퇴
  @Delete('withdrawal')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWithdrawal(@SessionUser() sessionUser: IUserWithoutPassword): Promise<{ message: string }> {
    const { userId } = sessionUser;
    await this.authService.withDraw(userId);
    return { message: '회원탈퇴가 성공적으로 완료되었습니다.' };
  }

  // 로그인
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async postSignIn(
    @Body() signInUserDto: SignInUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<{ message: string }> {
    await this.authService.signIn(signInUserDto, req, res);
    return { message: '로그인에 성공하였습니다.' };
  }

  // 로그아웃
  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  async postSignOut(@Req() req: Request, @Res() res: Response): Promise<{ message: string }> {
    await this.authService.signOut(req, res);
    return { message: '로그아웃에 성공하였습니다.' };
  }

  // 이메일 인증 발송
  @Post('sign-up/email')
  @HttpCode(HttpStatus.OK)
  async postSignUpEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
    await this.authService.sendVerificationEmail(verifyEmailDto);
    return { message: '회원가입 인증용 이메일을 발송하였습니다.' };
  }

  // 이메일 인증 확인
  @Post('sign-up/email-verification')
  @HttpCode(HttpStatus.OK)
  async postSignUpEmailVerification(@Body() body: { token: string }): Promise<{ message: string }> {
    const { token } = body;
    await this.authService.verifyEmail(token);
    return { message: '이메일 인증에 성공하였습니다.' };
  }

  // 이메일 찾기
  @Get('email')
  @HttpCode(HttpStatus.OK)
  async getEmail(@Body() findEmailDto: FindEmailDto) {
    const email = await this.authService.findEmail(findEmailDto);
    return { message: '이메일 찾기가 성공하였습니다.', email };
  }

  // 비밀번호 찾기 (임시 비밀번호 발급)
  @Get('password')
  @HttpCode(HttpStatus.OK)
  async getPassword(@Body() findPasswordDto: FindPasswordDto) {
    await this.authService.findPassword(findPasswordDto);
    return { message: '임시 비밀번호 발급이 성공하였습니다.' };
  }

  // 휴대폰 인증번호 발급
  @Post('phone')
  @HttpCode(HttpStatus.OK)
  async postPhoneVerificationCode(@Body() sendPhoneVerificationDto: SendPhoneVerificationDto) {
    const { phoneNumber } = sendPhoneVerificationDto;
    await this.authService.sendPhoneVerificationCode(phoneNumber);
    return { message: '휴대폰 인증번호가 발급되었습니다.' };
  }

  // 휴대폰 인증번호 발급 확인
  @Post('phone-verification')
  @HttpCode(HttpStatus.OK)
  async postPhoneVerificationConfirm(verifyPhoneNumberDto: VerifyPhoneNumberDto) {
    const { phoneNumber, code } = verifyPhoneNumberDto;
    await this.authService.verifyPhoneNumberCode(phoneNumber, code);
    return { message: '휴대폰 인증이 성공하였습니다.' };
  }

  // 사용자 상태 확인
  // 프론트엔드의 리다이렉션을 위함.
  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getStatus(@Req() req: Request, @Res() res: Response): Promise<{ message: string }> {
    const sessionId = req.cookies['connect.sid'];
    await this.authService.sendStatus(sessionId);
    return { message: '로그아웃에 성공하였습니다.' };
  }
}
