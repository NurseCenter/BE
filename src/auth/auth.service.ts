import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, FindEmailDto, FindPasswordDto, SendEmailDto, SignInUserDto, VerifyEmailDto } from './dto';
import Redis from 'ioredis';
import { AuthPasswordService, AuthSessionService, AuthSignInService, AuthUserService } from './services';
import { Request, Response } from 'express';
import { EMembershipStatus } from 'src/users/enums';
import { EmailService } from 'src/email/email.service';
import { Repository } from 'typeorm';
import { UsersEntity } from 'src/users/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthTwilioService } from './services/auth.twilio.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    @InjectRepository(UsersEntity) private userRepository: Repository<UsersEntity>,
    private readonly authUserService: AuthUserService,
    private readonly authPasswordService: AuthPasswordService,
    private readonly authSessionService: AuthSessionService,
    private readonly authSignInService: AuthSignInService,
    private readonly emailService: EmailService,
    private readonly authTwilioService: AuthTwilioService
  ) {}

  // 회원가입
  async signUp( 
  createUserDto: CreateUserDto): Promise<void> {
    await this.authUserService.createUser(createUserDto);
  }

  // 회원탈퇴
  async withDraw(sessionId: string): Promise<void> {
    await this.authUserService.deleteUser(sessionId);
  }

  // 로그인
  async signIn(signInUserDto: SignInUserDto, req: Request, res: Response){
    const { email, password } = signInUserDto;

    // 1. 이메일로 회원 찾기
    const user = await this.authUserService.findUserByEmail(email);
    if (!user) throw new UnauthorizedException('User not exist');

    // 2. 비밀번호 검증
    const isPasswordMatch = await this.authPasswordService.matchPassword(password, user.password);
    if (!isPasswordMatch) throw new UnauthorizedException('Password not match');

    // 3. req.login을 통해 세션에 사용자 정보 저장
    req.login(user, async (err) => {
      if (err) {
        console.error('Login failed', err);
        return res.status(401).json({ message: 'Login failed' });
      }

      // 4. 세션 ID 가져오기
      const sessionId = req.sessionID;

      // 5. 세션 ID와 회원 ID를 Redis에 저장
      await this.redisClient.hset(`sessionId:${sessionId}`, { sessionId: sessionId, userId: user.userId });

      // 6. MySQL에 회원 로그인 기록을 저장
      await this.authSignInService.saveLoginRecord(user.userId, req);

      // 7. 응답 전송
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
    res.clearCookie('connect.sid');

    res.status(200).json({ message: '로그아웃이 성공적으로 완료되었습니다.' });
  }

  // 회원가입 후 이메일 발송
  async sendVerificationEmail(verifyEmailDto: VerifyEmailDto): Promise<void> {
    // 사용자 상태 PENDING_VERIFICATION으로 변경
    const user = await this.authUserService.findUserByEmail(verifyEmailDto.email);
    await this.authUserService.updateUserStatusByUserId(user.userId, EMembershipStatus.PENDING_VERIFICATION);
    await this.userRepository.save(user);

    console.log("회원가입 후 이메일 발송 user.membershipStatus", user.membershipStatus)

    // 이메일 링크 생성
    const token = await this.authSessionService.generateSessionId();
    const emailVerificationLink = `${process.env.FRONTEND_URL}?token=${token}`;

    console.log("이메일 링크 생성 emailVerificationLink", emailVerificationLink)

    // Redis에 사용자 이메일과 토큰 저장
    await this.redisClient.set(`emailVerificationToken:${token}`, user.email); 

    // 이메일 발송 데이터 준비
    const sendEmailDto: SendEmailDto = {
      nickname: user.nickname,
      email: user.email,
      emailVerificationLink,
    };

    console.log("이메일 발송 데이터 endEmailDto", sendEmailDto)

    // 이메일 전송
    await this.emailService.sendVerificationEmail(sendEmailDto.email, sendEmailDto.nickname, sendEmailDto.emailVerificationLink);
  }

  // 회원가입 이메일 인증 확인
  async verifyEmail(token: string): Promise<{message: string}> {
    if (!token) throw new UnauthorizedException('토큰이 없습니다');

    // Redis에서 이메일 조회
    const email = await this.redisClient.get(`emailVerificationToken:${token}`);
    if (!email) throw new NotFoundException('Invalid or expired token');

    // 사용자 찾기
    const user = await this.authUserService.findUserByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    // 사용자 상태를 EMAIL_VERIFIED으로 변경
    await this.authUserService.updateUserStatusByEmail(email, EMembershipStatus.EMAIL_VERIFIED);
    await this.authSessionService.deleteSessionId(token);

    // 추가) 이미 사용자 상태가 email_verified = 2면 메일 요청이 계속 가지 않도록 해야함. => 주기를 정할 것

    console.log("토큰", token)

    // Redis에서 토큰 삭제
    await this.redisClient.del(`emailVerificationToken:${token}`);

    return { message: 'Email Verification success' };
  }

  // 이메일 찾기
  async findEmail(findEmailDto: FindEmailDto) {
    const { username, phoneNumber } = findEmailDto;
    const user = await this.authUserService.findUserByUsernameAndPhone(username, phoneNumber);
    return await this.authUserService.maskingEmail(user.email);
  }

  // 비밀번호 찾기
  async findPassword(findPasswordDto: FindPasswordDto): Promise<void> {
    const { username, email } = findPasswordDto;

    const user = await this.authUserService.findUserByUsernameAndEmail(username, email);
    if (!user) throw new Error('User not found');

    const tempPassword = await this.authPasswordService.createTempPassword();

    await this.redisClient.hmset(`tempPassword:${user.userId}`, {
      userId: user.userId,
      tempPassword,
    });
    await this.redisClient.expire(`tempPassword:${user.userId}`, 7200);

    user.isTempPassword = true;
    await this.userRepository.save(user);

    await this.emailService.sendTempPasswordEmail(user.email, user.nickname, tempPassword);
  }

  // 휴대폰 번호 인증 메시지 보내기
  // +821012341234 로 파싱 필요함.
  async sendPhoneVerificationCode(to: string){
    return this.authTwilioService.sendVerificationCode({ to });
  }
  
  // 휴대폰 번호 인증 확인
  async verifyPhoneNumberCode(to: string, code: string){
    return this.authTwilioService.checkVerificationCode({ to, code });
  }

  // 로그인한 사용자의 회원 상태 확인
  async sendStatus(sessionId: string) {
    const userId = await this.authSessionService.findUserIdFromSession(sessionId);
    return this.authUserService.checkStatusByUserId(userId);
  }
}
