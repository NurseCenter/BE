import { Body, Controller, Delete, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { Request as expReq } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto';

@Controller('auth')
export class AuthController {
    constructor (
        private readonly authService: AuthService,
    ) {}

    // 회원가입
    @Post('sign-up')
    @HttpCode(HttpStatus.CREATED)
    async postSignUp(@Body() createUserDto: CreateUserDto): Promise<{ message: string}> {
        await this.authService.createUser(createUserDto);
        return { message: "회원가입이 성공적으로 완료되었습니다."}
    }

    // 회원탈퇴
    @Delete('withdrawal')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteUser(@Req() req: expReq): Promise<{ message: string }> {
        const sessionId = req.cookies['sessionId'];
        await this.authService.deleteUser(sessionId);
        return { message: "회원탈퇴가 성공적으로 완료되었습니다."}
    }

    // 로그인

    // 로그아웃

    // 이메일 인증

    // 이메일 인증 확인

    // 휴대폰번호 찾기

    // 이메일 찾기

    // 비밀번호 찾기

    // 임시 비밀번호 발급
}
