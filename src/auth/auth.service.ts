import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, FindEmailDto, FindPasswordDto, SendEmailDto, SignInUserDto, VerifyEmailDto } from './dto';
import Redis from 'ioredis';
import { AuthPasswordService, AuthSessionService, AuthSignInService, AuthUserService } from './services';
import { Request, Response } from 'express';
import { EMembershipStatus } from 'src/users/enums';
import { EmailService } from 'src/email/email.service';
import { AuthTwilioService } from './services/auth.twilio.service';
import { maskEmail } from 'src/common/utils/email.utils';
import { UsersDAO } from 'src/users/users.dao';

@Injectable()
export class AuthService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly authUserService: AuthUserService,
    private readonly authPasswordService: AuthPasswordService,
    private readonly authSessionService: AuthSessionService,
    private readonly authSignInService: AuthSignInService,
    private readonly emailService: EmailService,
    private readonly authTwilioService: AuthTwilioService,
    private readonly usersDAO: UsersDAO,
  ) {}

  // 회원가입
  async signUp(createUserDto: CreateUserDto): Promise<void> {
    await this.authUserService.addNewUser(createUserDto);
  }

  // 회원탈퇴
  async withDraw(userId: number): Promise<void> {
    await this.authUserService.deleteUser(userId);
  }

  // 로그인
  async signIn(signInUserDto: SignInUserDto, req: Request, res: Response) {
    const { email, password } = signInUserDto;

    // 1. 이메일로 회원 찾기
    const user = await this.usersDAO.findUserByEmail(email);
    if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

    // 2. 이미 탈퇴한 유저인지 확인
    await this.authUserService.checkDeletedByUserId(user.userId);

    // 3. 비밀번호 검증
    const isPasswordMatch = await this.authPasswordService.matchPassword(password, user.password);
    if (!isPasswordMatch) throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');

    // 4. req.login을 통해 세션에 사용자 정보 저장
    req.login(user, async (err) => {
      if (err) {
        console.error('로그인 실패: ', err);
        return res.status(401).json({ message: '로그인에 실패하였습니다.' });
      }

      // 5. MySQL에 회원 로그인 기록을 저장
      await this.authSignInService.saveLoginRecord(user.userId, req);

      // 6. 응답 전송
      return res.status(200).json({
        message: '로그인이 완료되었습니다.',
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
    const user = await this.authUserService.updateUserStatusToPending(verifyEmailDto.email);

    // 이메일 링크 생성
    const token = await this.authSessionService.generateSessionId();
    const emailVerificationLink = `${process.env.FRONTEND_URL}?token=${token}`;

    // Redis에 사용자 이메일과 토큰 저장
    await this.redisClient.set(`emailVerificationToken:${token}`, user.email);

    // 이메일 발송 데이터 준비
    const sendEmailDto: SendEmailDto = {
      nickname: user.nickname,
      email: user.email,
      emailVerificationLink,
    };

    // 이메일 전송
    await this.emailService.sendVerificationEmail(
      sendEmailDto.email,
      sendEmailDto.nickname,
      sendEmailDto.emailVerificationLink,
    );
  }

  // 회원가입 이메일 인증 확인
  async verifyEmail(token: string): Promise<{ message: string }> {
    if (!token) throw new UnauthorizedException('토큰이 없습니다');

    // Redis에서 이메일 조회
    const email = await this.redisClient.get(`emailVerificationToken:${token}`);
    if (!email) throw new NotFoundException('해당 이메일 확인 링크가 존재하지 않습니다.');

    // 사용자 찾기
    const user = await this.usersDAO.findUserByEmail(email);
    if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

    // 사용자 상태를 EMAIL_VERIFIED으로 변경
    await this.authUserService.updateUserStatusByEmail(email, EMembershipStatus.EMAIL_VERIFIED);

    // 추가) 이미 사용자 상태가 email_verified = 2면 메일 요청이 계속 가지 않도록 해야함. => 주기를 정할 것

    // Redis에서 토큰 삭제
    await this.redisClient.del(`emailVerificationToken:${token}`);

    return { message: '회원가입용 이메일 인증이 완료되었습니다.' };
  }

  // 이메일 찾기
  async findEmail(findEmailDto: FindEmailDto) {
    const { username, phoneNumber } = findEmailDto;
    const user = await this.usersDAO.findUserByUsernameAndPhone(username, phoneNumber);
    return maskEmail(user.email);
  }

  // 비밀번호 찾기
  async findPassword(findPasswordDto: FindPasswordDto): Promise<void> {
    const { username, email } = findPasswordDto;

    const user = await this.usersDAO.findUserByUsernameAndEmail(username, email);
    if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

    const tempPassword = await this.authPasswordService.createTempPassword();

    await this.redisClient.hmset(`tempPassword:${user.userId}`, {
      userId: user.userId,
      tempPassword,
    });
    await this.redisClient.expire(`tempPassword:${user.userId}`, 7200);

    user.isTempPassword = true;
    await this.usersDAO.saveUser(user);

    await this.emailService.sendTempPasswordEmail(user.email, user.nickname, tempPassword);
  }

  // 휴대폰 번호 인증 메시지 보내기
  // +821012341234 로 파싱 필요함.
  async sendPhoneVerificationCode(to: string) {
    return this.authTwilioService.sendVerificationCode({ to });
  }

  // 휴대폰 번호 인증 확인
  async verifyPhoneNumberCode(to: string, code: string) {
    return this.authTwilioService.checkVerificationCode({ to, code });
  }

  // 로그인한 사용자의 회원 상태 확인
  async sendStatus(userId: number) {
    return this.authUserService.checkStatusByUserId(userId);
  }
}
