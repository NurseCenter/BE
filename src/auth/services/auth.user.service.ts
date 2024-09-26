import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EMembershipStatus } from 'src/users/enums';
import { ConversionUtil } from 'src/common/utils/conversion.utils';
import { UsersDAO } from 'src/users/users.dao';
import { CreateUserDto, SignInUserDto } from '../dto';
import { AuthPasswordService } from './auth.password.service';
import { IUserWithoutPassword, ISignUpResponse } from '../interfaces';
import { SuspendedUsersDAO } from 'src/admin/dao';
import { AuthSignInService } from './auth.signIn.service';
import { RejectedUsersDAO } from 'src/admin/dao/rejected-users.dao';

@Injectable()
export class AuthUserService {
  constructor(
    private readonly authPasswordService: AuthPasswordService,
    private readonly authSignInService: AuthSignInService,
    private readonly usersDAO: UsersDAO,
    private readonly suspendedUsersDAO: SuspendedUsersDAO,
    private readonly rejectedUsersDAO: RejectedUsersDAO,
  ) {}

  // 회원 생성
  async addNewUser(createUserDto: CreateUserDto): Promise<ISignUpResponse> {
    const { email, password, nickname } = createUserDto;

    // 이메일로 존재하는 회원 확인
    const existingUser = await this.usersDAO.findUserByEmail(email);

    if (existingUser) {
      if (existingUser.deletedAt !== null) {
        throw new ConflictException('이미 탈퇴한 회원입니다.');
      } else {
        throw new ConflictException('이미 가입된 회원입니다.');
      }
    }

    // 닉네임 중복 여부 확인
    const nicknameExists = await this.usersDAO.checkNicknameExists(nickname);
    if (nicknameExists) {
      throw new ConflictException('이미 사용 중인 닉네임 입니다.');
    }

    // 해싱된 비밀번호 가져오기
    const hashedPassword = await this.authPasswordService.createHashedPassword(password);

    // 사용자 엔티티 생성 및 비밀번호 설정
    const newUser = await this.usersDAO.createUser(createUserDto);
    newUser.password = hashedPassword;
    await this.usersDAO.saveUser(newUser);

    // 새로 가입한 회원의 회원 ID 반환
    return {
      userId: newUser.userId,
      email: newUser.email,
      nickname: newUser.nickname,
    };
  }

  // 입력받은 회원정보가 유효한지 확인
  async validateUser(signInUserDto: SignInUserDto): Promise<IUserWithoutPassword | null> {
    // 이메일로 회원 찾기
    const user = await this.usersDAO.findUserByEmail(signInUserDto.email);
    if (!user) return null;

    // 비밀번호 일치하는지 확인
    const isPasswordMatched = await this.authPasswordService.matchPassword(signInUserDto.password, user.password);

    if (!isPasswordMatched) return null;

    // 비밀번호를 제외한 사용자 정보 반환
    const { password, ...userWithoutPassword } = user;

    const { dateToISOString } = ConversionUtil;

    const returnedUser = {
      ...userWithoutPassword,
      // 날짜 데이터 타입 ISOstring으로 변환해줌.
      createdAt: dateToISOString(user.createdAt),
      deletedAt: dateToISOString(user.deletedAt),
      suspensionEndDate: dateToISOString(user.suspensionEndDate),
    };

    return returnedUser;
  }

  // 회원 ID로 회원 상태 변경
  async updateUserStatusByUserId(userId: number, status: EMembershipStatus) {
    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');
    user.membershipStatus = status;
    await this.usersDAO.saveUser(user);
  }

  // 회원 ID로 회원 상태 변경
  async updateUserStatusByEmail(email: string, status: EMembershipStatus) {
    const user = await this.usersDAO.findUserByEmail(email);
    if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');
    user.membershipStatus = status;
    await this.usersDAO.saveUser(user);
  }

  // 회원 탈퇴
  async deleteUser(userId: number): Promise<void> {
    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

    if (user.deletedAt !== null) throw new ConflictException('이미 탈퇴한 회원입니다.');

    user.deletedAt = new Date();
    await this.usersDAO.saveUser(user);
  }

  // 회원 ID로 이미 탈퇴한 회원인지 확인
  async checkDeletedByUserId(userId: number): Promise<void> {
    const user = await this.usersDAO.findUserByUserId(userId);

    if (user && user.deletedAt !== null) {
      throw new ConflictException('이미 탈퇴한 회원입니다.');
    }
  }

  // 회원 ID로 회원 상태 확인
  async checkUserStatusByUserId(userId: number) {
    const user = await this.usersDAO.findUserByUserId(userId);
    const status = user.membershipStatus;

    const suspensionDetails = await this.suspendedUsersDAO.findSuspendedUserInfoByUserId(userId);
    const isSuspended = !!suspensionDetails;

    const rejectedUser = await this.rejectedUsersDAO.findRejectedUserByUserId(userId);

    return {
      userId: user.userId, // 회원 ID
      email: user.email, // 이메일
      nickname: user.nickname, // 닉네임
      membershipStatus: status, // 회원 상태
      rejected: user.rejected, // 정회원 승인 거절 여부
      rejectedReason: rejectedUser?.rejectedReason, // 정회원 승인 거절 이유
      isTempPasswordSignIn: await this.authSignInService.checkTempPasswordSignIn(userId), // 임시 비밀번호 로그인 여부
      isSuspended, // 계정 정지 여부
      ...(isSuspended ? suspensionDetails : {}), // 정지사유, 정지해제 날짜, 정지 기간
    };
  }

  // 회원 ID로 관리자 여부 확인
  async checkIsAdminByUserId(userId: number): Promise<boolean> {
    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');
    if (user.deletedAt !== null) throw new ConflictException('이미 탈퇴한 회원입니다.');
    return user.isAdmin ? true : false;
  }

  // 회원 상태 이메일 발송 후 Pending으로 변경
  async updateUserStatusToPending(email: string) {
    const user = await this.usersDAO.findUserByEmail(email);
    if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

    if (user.membershipStatus === EMembershipStatus.EMAIL_VERIFIED)
      throw new ConflictException('이미 이메일 인증이 완료된 회원입니다.');
    if (user.membershipStatus === EMembershipStatus.APPROVED_MEMBER)
      throw new ConflictException('이미 정회원으로 이메일 인증이 필요하지 않습니다.');

    user.membershipStatus = EMembershipStatus.PENDING_VERIFICATION;
    await this.usersDAO.saveUser(user);

    return user;
  }

  // 회원 정지 여부 확인
  async isUserSuspended(userId: number): Promise<boolean> {
    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) {
      throw new NotFoundException('해당 회원이 존재하지 않습니다.');
    }

    const suspendedUser = await this.suspendedUsersDAO.findSuspendedUserByUserId(userId);

    // suspendedUser가 존재하지 않으면 false
    if (!suspendedUser) {
      return false;
    }

    // deletedAt이 null이면 정지 상태
    if (!suspendedUser.deletedAt) {
      return true;
    }

    // suspensionEndDate가 있는 경우
    // 현재 날짜보다 최신이면 정지 상태
    if (user.suspensionEndDate) {
      const now = new Date();
      return user.suspensionEndDate > now;
    }

    // 나머지 경우는 정지되지 않은 것으로 간주
    return false;
  }
}
