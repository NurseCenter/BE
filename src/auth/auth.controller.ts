import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
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
    async signUp(@Body() createUserDto: CreateUserDto): Promise<{ message: string}> {
        await this.authService.createUser(createUserDto);
        return { message: "회원가입이 성공적으로 완료되었습니다."}
    }

    // 회원탈퇴

    // 로그인

    // 로그아웃

    // 이메일 인증

    // 이메일 인증 확인

    // 휴대폰번호 찾기

    // 이메일 찾기

    // 비밀번호 찾기

    // 임시 비밀번호 발급
}
