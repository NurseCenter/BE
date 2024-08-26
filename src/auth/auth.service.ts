import { ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, SignInUserDto } from './dto';
import Redis from 'ioredis';
import { LoginsEntity } from './entities/logins.entity';
import { AuthPasswordService, AuthSessionService, AuthSignInService, AuthUserService } from './services';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
    constructor(
        @Inject('REDIS_CLIENT')
        private readonly redisClient: Redis,

        private readonly authUserService: AuthUserService,
        private readonly authPasswordService: AuthPasswordService,
        private readonly authSessionService: AuthSessionService,
        private readonly authSignInService: AuthSignInService
    ){}

    // 회원가입
    async signUp(createUserDto: CreateUserDto) {
        await this.authUserService.createUser(createUserDto);
    }

    // 회원탈퇴
    async withDraw(sessionId: string) {
        await this.authUserService.deleteUser(sessionId);
    }

    // 로그인
    async signIn(signInUserDto: SignInUserDto, req: Request, res: Response) {
        const { email, password } = signInUserDto;

        // 1. 이메일로 회원 찾기
        const user = await this.authUserService.findUserByEmail(email);

        if (!user) throw new UnauthorizedException('User not exist');

        // 2. 비밀번호 검증
        const isPasswordMatch = await this.authPasswordService.matchPassword(password, user.password);

        if (!isPasswordMatch) throw new UnauthorizedException('Password not match');

        // 3. 세션 ID 생성
        const sessionId = await this.authSessionService.generateSessionId();

        // 4. 세션 ID와 회원 ID를 Redis에 저장
        await this.redisClient.hmset(`sessionId:${sessionId}`, { sessionId: sessionId, userId: user.userId });

        // 5. MySQL에 회원 로그인 기록을 저장
        await this.authSignInService.saveLoginRecord(user.userId, req);

        // 6. 쿠키 발급
        await this.authSessionService.sendCookie(res, sessionId);

        // 7. 로그인 성공 메시지 리턴
        return { message : "로그인에 성공하였습니다." }
    }
}
