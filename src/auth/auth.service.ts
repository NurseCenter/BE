import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, FindEmailDto, FindPasswordDto, SendEmailDto, SignInUserDto } from './dto';
import Redis from 'ioredis';
import { AuthPasswordService, AuthSessionService, AuthSignInService, AuthUserService } from './services';
import { Request, Response } from 'express';
import { EMembershipStatus } from 'src/users/enums';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
    constructor(
        @Inject('REDIS_CLIENT')
        private readonly redisClient: Redis,
        private readonly authUserService: AuthUserService,
        private readonly authPasswordService: AuthPasswordService,
        private readonly authSessionService: AuthSessionService,
        private readonly authSignInService: AuthSignInService,
        private readonly emailService: EmailService,
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

    // 회원가입 후 이메일 발송
    async sendEmail(createUserDto: CreateUserDto): Promise<void> {
        const { email } = createUserDto;

        // 사용자 상태 PENDING_VERIFICATION으로 변경
        const user = await this.authUserService.findUserByEmail(email);
        await this.authUserService.updateUserStatus(user.userId, EMembershipStatus.PENDING_VERIFICATION);

        // 이메일 링크 생성
        const token = await this.authSessionService.generateSessionId();
        const emailVerificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`; // 프론트엔드 리액트 라우터

        // Redis에 저장 (TTL 1시간 설정)
        // await this.redisClient.hmset(`emailVerification:${token}`, {
        //     userId: user.userId,
        //     emailVerificationLink,
        // });
        // await this.redisClient.expire(`emailVerification:${token}`, 3600); 

        // 이메일 발송 데이터 준비
        const sendEmailDto: SendEmailDto = {
            nickname: user.nickname,
            email: user.email,
            emailVerificationLink
        }

        // 이메일 전송 데이터 준비
        const sendEmailConfig = {
            to: user.email, 
            subject: "중간이들 회원가입을 환영합니다. 인증 링크를 눌러주세요.", 
            templateName: 'sign-up-email', 
            data: sendEmailDto
        }

        // 이메일 전송
        await this.emailService.sendEmail(sendEmailConfig.to, sendEmailConfig.subject, sendEmailConfig.templateName, sendEmailConfig.data);
    }

    // 회원가입 이메일 인증
    async verifyEmail(token: string) {
        if (!token) throw new UnauthorizedException("토큰이 없습니다")

        const userId = await this.authSessionService.getUserIdFromSession(token);

        if (!userId) throw new NotFoundException("해당 회원이 존재하지 않습니다.")

        await this.authUserService.updateUserStatus(userId, EMembershipStatus.EMAIL_VERIFIED);

        await this.authSessionService.deleteSessionId(token);

        return { message: "Email Verification success"}
    }

    // 이메일 찾기
    async findEmail(findEmailDto: FindEmailDto) {
        const { username, phoneNumber } = findEmailDto;
        const user = await this.authUserService.findUserByUsernameAndPhone(username, phoneNumber);
        const maskedEmail = await this.authUserService.maskingEmail(user.email);
        return maskedEmail;
    }

    // 비밀번호 찾기
    async findPassword(findPasswordDto: FindPasswordDto) {

    }
}
