import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EMembershipStatus } from 'src/users/enums';
import { dateToISOString } from 'src/common/utils/data.utils';
import { UsersDAO } from 'src/users/users.dao';
import { CreateUserDto, SignInUserDto } from '../dto';
import { AuthPasswordService } from './auth.password.service';
import { IUserWithoutPassword, IMembershipStatusResponse } from '../interfaces';

@Injectable()
export class AuthUserService {
  constructor(
    private readonly authPasswordService: AuthPasswordService,
    private readonly usersDAO: UsersDAO,
  ) {}

  // 회원 생성
  async addNewUser(createUserDto: CreateUserDto): Promise<number> {
    const { email, password, nickname } = createUserDto;

    const existingUser = await this.usersDAO.findUserByEmail(email);

    if (existingUser) {
      if (existingUser.deletedAt !== null) {
        throw new ConflictException('이미 탈퇴한 회원입니다.');
      } else if (existingUser.email === email) {
        throw new ConflictException('이미 가입된 회원입니다.');
      } else if (existingUser.nickname === nickname) {
        throw new ConflictException('이미 존재하는 닉네임입니다.');
      }
    }

    // 해싱된 비밀번호 가져오기
    const hashedPassword = await this.authPasswordService.createHashedPassword(password);

    // 사용자 엔티티 생성 및 비밀번호 설정
    const newUser = await this.usersDAO.createUser(createUserDto);
    newUser.password = hashedPassword;
    await this.usersDAO.saveUser(newUser);

    // 새로 가입한 회원의 회원 ID 반환
    return newUser.userId;
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
  async checkStatusByUserId(userId: number): Promise<IMembershipStatusResponse> {
    const user = await this.usersDAO.findUserByUserId(userId);
    const status = user.membershipStatus;

    switch (status) {
      case EMembershipStatus.NON_MEMBER:
        return { status: 'non_member', message: '회원가입 폼이 제출되었습니다. 인증 절차를 진행해 주세요.' };
      case EMembershipStatus.PENDING_VERIFICATION:
        return { status: 'pending_verification', message: '회원가입 확인용 이메일을 확인해주세요.' };
      case EMembershipStatus.EMAIL_VERIFIED:
        return { status: 'email_verified', message: '관리자가 회원가입 승인 요청을 검토중입니다.' };
      case EMembershipStatus.APPROVED_MEMBER:
        return { status: 'approved_member', message: '회원가입 승인이 완료된 정회원입니다.' };
      default:
        throw new Error('존재하지 않는 사용자 상태입니다.');
    }
  }

  // 회원 상태 이메일 발송 후 Pending으로 변경
  async updateUserStatusToPending(email: string) {
    const user = await this.usersDAO.findUserByEmail(email);
    if (!user) throw new ConflictException('사용자를 찾을 수 없습니다.');
    if (user.membershipStatus === EMembershipStatus.EMAIL_VERIFIED)
      throw new ConflictException('이미 이메일 인증이 완료된 회원입니다.');
    if (user.membershipStatus === EMembershipStatus.APPROVED_MEMBER)
      throw new ConflictException('이미 정회원으로 이메일 인증이 필요하지 않습니다.');

    user.membershipStatus = EMembershipStatus.PENDING_VERIFICATION;
    await this.usersDAO.saveUser(user);

    return user;
  }
}
