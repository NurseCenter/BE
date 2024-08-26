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

        console.log("service - user", user)

        // 2. 비밀번호 검증
        const isPasswordMatch = await this.authPasswordService.matchPassword(password, user.password);
        if (!isPasswordMatch) throw new UnauthorizedException('Password not match');

        // 3. req.login을 통해 세션에 사용자 정보 저장
        req.login(user, async (err) => {
            // if (err) throw new UnauthorizedException('Login failed');
            if (err) {
                console.error("Login failed", err);
                return res.status(401).json({ message: 'Login failed' });
            }

            // 4. 세션 ID 가져오기
            const sessionId = req.sessionID;

            console.log("service - sessionId", sessionId);

            // 5. 세션 ID와 회원 ID를 Redis에 저장
            await this.redisClient.hset(`sessionId:${sessionId}`, { sessionId: sessionId, userId: user.userId });

            console.log("redis에 저장 완료");

            // Redis에서 확인
            const result = await this.redisClient.hgetall(`sessionId:${sessionId}`);
            console.log("redis에서 가져온 데이터", result);

            // 6. MySQL에 회원 로그인 기록을 저장
            await this.authSignInService.saveLoginRecord(user.userId, req);

            console.log("로그인 기록 저장 완료");

            // 8. 응답 전송
            return res.status(200).json({
                message: 'Login successful',
                user: {
                    userId: user.userId,
                    email: user.email,
                    nickname: user.nickname,
                },
            });
        }); 
    }

    // 로그아웃
    async signOut(req: Request, res: Response): Promise<void> {
        const sessionId = req.sessionID;

        await this.redisClient.del(`sessionId:${sessionId}`);

        res.clearCookie('connect.sid')

        res.status(200).json({ message: "로그아웃이 성공적으로 완료되었습니다."})
    }
}
