import { ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, FindEmailDto, FindPasswordDto, SendEmailDto, SignInUserDto, VerifyEmailDto } from './dto';
import Redis from 'ioredis';
import { AuthPasswordService, AuthSessionService, AuthSignInService, AuthUserService } from './services';
import { Request, Response } from 'express';
import { EMembershipStatus } from 'src/users/enums';
import { EmailService } from 'src/email/email.service';
import { AuthTwilioService } from './services/auth.twilio.service';
import { maskEmail } from 'src/common/utils/email.utils';
import { UsersDAO } from 'src/users/users.dao';
import { promisify } from 'util';
import clearCookieOptions from './cookie-options/clear-cookie-options';
import { ISignUpResponse } from './interfaces';
import { extractSessionIdFromCookie } from 'src/common/utils/extract-sessionId.util';
import { RejectedUsersDAO } from 'src/admin/dao/rejected-users.dao';
import { SuspendedUsersDAO } from 'src/admin/dao/suspended-users.dao';
import { formattingPhoneNumber } from 'src/common/utils/phone-number-utils';
import { InvalidPhoneNumberException } from 'src/common/exceptions/twilio-sms.exceptions';
import { throwIfUserNotExists } from 'src/common/error-handlers/user-error-handlers';

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
    private readonly suspendedUsersDAO: SuspendedUsersDAO,
    private readonly rejectedUsersDAO: RejectedUsersDAO,
  ) {}

  // 회원가입
  async signUp(createUserDto: CreateUserDto): Promise<ISignUpResponse> {
    const userInfo = await this.authUserService.addNewUser(createUserDto);
    return userInfo;
  }

  // 회원탈퇴
  async withDraw(userId: number, req: Request, res: Response): Promise<void> {
    try {
      // 1. 로그아웃
      await this.signOut(req, res);

      // 2. 회원정보 삭제
      await this.authUserService.deleteUser(userId);
    } catch (error) {
      console.error('회원탈퇴 처리 중 오류: ', error);
      throw new Error('회원탈퇴 처리 중 오류 발생');
    }
  }

  // 로그인
  async signIn(signInUserDto: SignInUserDto, req: Request, res: Response) {
    const { email, password } = signInUserDto;

    // 1. 이메일로 회원 찾기
    const user = await this.usersDAO.findUserByEmail(email);
    throwIfUserNotExists(user, undefined, email);

    // 2. 이미 탈퇴한 유저인지 확인
    await this.authUserService.checkDeletedByUserId(user.userId);

    // 3. 비밀번호 검증
    const isPasswordMatch = await this.authPasswordService.matchPassword(password, user.password);
    if (!isPasswordMatch) throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');

    // 4. 임시 비밀번호로 로그인했는지 확인
    const isTempPasswordSignIn = await this.authSignInService.checkTempPasswordSignIn(user.userId);

    // 5. 회원의 정지 여부 확인
    const isSuspended = await this.authUserService.isUserSuspended(user.userId);

    let suspensionDetails = null;
    if (isSuspended) {
      // 6. 회원의 정지 정보 가져오기 (정지된 경우에만)
      suspensionDetails = await this.suspendedUsersDAO.findSuspendedUserInfoByUserId(user.userId);
    }

    // 7. 회원의 정회원 거절 여부 정보 가져오기
    let rejectedUser = null;
    let rejectedReason = null;
    if (user.rejected) {
      rejectedUser = await this.rejectedUsersDAO.findRejectedUserByUserId(user.userId);
      rejectedReason = rejectedUser?.rejectedReason;
    }

    // 8. req.login을 통해 세션에 사용자 정보 저장
    req.login(user, async (err) => {
      if (err) {
        console.error('로그인 실패: ', err);
        return res.status(401).json({ message: '로그인에 실패하였습니다.' });
      }

      // console.log('현재 로그인 후 req.sessionID', req.sessionID);

      // 9. MySQL에 회원 로그인 기록을 저장
      await this.authSignInService.saveLoginRecord(user.userId, req);

      // 전송할 메시지 설정
      const message = isTempPasswordSignIn
        ? '임시 비밀번호로 로그인되었습니다. 새 비밀번호를 설정해 주세요.'
        : '로그인이 완료되었습니다.';

      // 10. 응답 전송
      return res.status(200).json({
        message,
        user: {
          nickname: user.nickname, // 닉네임
          membershipStatus: user.membershipStatus, // 회원 상태
          rejected: user.rejected, // 정회원 승인 거절 여부
          ...(rejectedReason !== null && { rejectedReason }), // 정회원 승인 거절 사유
          isTempPasswordSignIn, // 임시 비밀번호 로그인 여부
          isSuspended, // 계정 활동 정지 여부
          ...suspensionDetails, // 정지 사유
        },
      });
    });
  }

  // 로그아웃
  async signOut(req: Request, res: Response): Promise<void> {
    const sessionId = req.sessionID;
    const keyToDelete = `sess:${sessionId}`;
    // console.log('로그아웃 세션 ID', sessionId);

    try {
      // Redis에서 세션 삭제
      const delAsync = promisify(this.redisClient.del).bind(this.redisClient);
      await delAsync(keyToDelete);

      // 세션 제거
      const destroyAsync = promisify(req.session.destroy).bind(req.session);
      await destroyAsync();

      // 쿠키 삭제
      res.clearCookie('connect.sid', clearCookieOptions());
    } catch (error) {
      console.error('로그아웃 처리 중 오류: ', error);
      throw error;
    }
  }

  // 회원가입 후 이메일 발송
  async sendVerificationEmail(verifyEmailDto: VerifyEmailDto): Promise<void> {
    // 사용자 상태 PENDING_VERIFICATION으로 변경
    const user = await this.authUserService.updateUserStatusToPending(verifyEmailDto.email);

    // 이메일 링크 생성
    const token = await this.authSessionService.generateSessionId();
    const emailVerificationLink = `${process.env.FRONTEND_HOST_URL}/sign-up/email?token=${token}`;

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

    // 회원 찾기
    const user = await this.usersDAO.findUserByEmail(email);
    throwIfUserNotExists(user, undefined, email);

    // 회원 이메일 상태를 확인
    if (user.membershipStatus === EMembershipStatus.PENDING_VERIFICATION) {
      // 사용자 상태를 EMAIL_VERIFIED으로 변경
      await this.authUserService.updateUserStatusByUserId(user.userId, EMembershipStatus.EMAIL_VERIFIED);
    } else if (user.membershipStatus === EMembershipStatus.NON_MEMBER) {
      throw new NotFoundException('회원 가입 양식 제출 후 인증용 메일이 전송되지 않은 회원입니다.');
    } else if (user.membershipStatus === EMembershipStatus.APPROVED_MEMBER) {
      throw new ConflictException('이미 정회원이라 이메일 인증이 필요하지 않는 회원입니다.');
    } else {
      throw new ConflictException('이미 이메일 인증이 완료되어 관리자의 정회원 승인이 대기중인 회원입니다.');
    }

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

  // 비밀번호 찾기 (임시 비밀번호 발급)
  async findPassword(findPasswordDto: FindPasswordDto): Promise<string> {
    const { username, email } = findPasswordDto;

    const user = await this.usersDAO.findUserByEmail(email);
    throwIfUserNotExists(user, undefined, email);

    if (user.username !== username) throw new UnauthorizedException('비밀번호 찾기에 대한 권한이 없습니다.');

    const tempPassword = await this.authPasswordService.createTempPassword();

    await this.redisClient.hset(`tempPassword:${user.userId}`, {
      userId: user.userId,
      tempPassword,
    });
    await this.redisClient.expire(`tempPassword:${user.userId}`, 7200); // 유효기간 : 2시간

    user.tempPasswordIssuedDate = new Date();
    user.password = await this.authPasswordService.createHashedPassword(tempPassword);
    await this.usersDAO.saveUser(user);

    const maskedEmail = maskEmail(email);

    await this.emailService.sendTempPasswordEmail(user.email, user.nickname, tempPassword);

    return maskedEmail;
  }

  // 휴대폰 번호 인증 메시지 보내기
  async sendPhoneVerificationCode(to: string) {
    const formattedPhoneNumber = formattingPhoneNumber(to);
    if (!formattedPhoneNumber) {
      throw new InvalidPhoneNumberException();
    }
    return this.authTwilioService.sendVerificationCode({ to: formattedPhoneNumber });
  }

  // 휴대폰 번호 인증 확인
  async verifyPhoneNumberCode(to: string, code: string) {
    return await this.authTwilioService.checkVerificationCode({ to, code });
  }

  // 로그인한 사용자의 회원 상태 전달
  async sendUserStatus(userId: number) {
    return this.authUserService.checkUserStatusByUserId(userId);
  }

  // 세션 만료 여부 확인 후 전달
  async sendSessionStatus(req: Request): Promise<{ expires: boolean; remainingTime?: string; userId?: number }> {
    const sessionId = req.cookies[`connect.sid`];
    const cleanedSessionId = extractSessionIdFromCookie(sessionId);
    const sessionData = await this.authSessionService.getSessionData(cleanedSessionId);
    if (!sessionData) return { expires: true };

    const currentTime = new Date();
    const expiresTime = new Date(sessionData?.cookie?.expires);

    if (currentTime > expiresTime) {
      return { expires: true };
    } else {
      const remainingTime = expiresTime.getTime() - currentTime.getTime(); // 남은 시간 (밀리초)
      const remainingTimeInMinutes = Math.floor(remainingTime / (1000 * 60)); // 남은 시간 (분)

      const userId = sessionData?.passport?.user?.userId || null;

      return { expires: false, remainingTime: `${remainingTimeInMinutes} 분`, userId: Number(userId) };
    }
  }

  // 관리자 여부 확인 후 전달
  async sendIsAdmin(req: Request): Promise<{ isAdmin: boolean }> {
    // 세션 ID에서 userId 추출
    const sessionId = req.cookies['connect.sid'];
    const cleanedSessionId = extractSessionIdFromCookie(sessionId);
    const userId = await this.authSessionService.findUserIdFromSession(cleanedSessionId);

    // userId로 isAdmin 여부 확인
    const isAdmin = await this.authUserService.checkIsAdminByUserId(userId);
    return { isAdmin };
  }
}
