import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto, SignInUserDto } from './dto';

@Controller('auth')
export class AuthController {
    constructor (
        private readonly authService: AuthService,
    ) {}

    // 회원가입
    @Post('sign-up')
    @HttpCode(HttpStatus.CREATED)
    async postSignUp(@Body() createUserDto: CreateUserDto): Promise<{ message: string}> {
        await this.authService.signUp(createUserDto);
        return { message: "회원가입이 성공적으로 완료되었습니다."}
    }

    // 회원탈퇴
    @Delete('withdrawal')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteWithdrawal(@Req() req: Request): Promise<{ message: string }> {
        const sessionId = req.cookies['sessionId'];
        await this.authService.withDraw(sessionId);
        return { message: "회원탈퇴가 성공적으로 완료되었습니다."}
    }

    // 로그인
    @Post('sign-in')
    @HttpCode(HttpStatus.OK)
    async postSignIn(@Body() signInUserDto: SignInUserDto, @Req() req: Request, @Res() res: Response): Promise<{ message: string }> {
        await this.authService.signIn(signInUserDto, req, res);
        return { message : "로그인에 성공하였습니다." };
    }

    // 로그아웃
    @Post('sign-out')
    @HttpCode(HttpStatus.OK)
    async postSignOut(@Req() req: Request, @Res() res: Response): Promise<{ message: string }> {
        await this.authService.signOut(req, res);
        return { message : "로그아웃에 성공하였습니다." };
    }

    // 이메일 인증
    @Get('sign-up/email')
    @HttpCode(HttpStatus.OK)
    async getSignUpEmail(@Body() createUserDto: CreateUserDto): Promise<{ message: string }> {
        await this.authService.sendEmail(createUserDto);
        return { message : "이메일 발송에 성공하였습니다." };
    }

    // 이메일 인증 확인
    @Get('sign-up/email-verification')
    @HttpCode(HttpStatus.OK)
    async getSignUpEmailVerification(@Query('token') token: string): Promise<{ message: string }>{
        await this.authService.verifyEmail(token);
        return { message : "이메일 인증에 성공하였습니다." };
    }

    // 휴대폰번호 찾기

    // 이메일 찾기

    // 비밀번호 찾기

    // 임시 비밀번호 발급
}
