import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersEntity } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, SignInUserDto } from '../dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthPasswordService } from './auth.password.service';
import { AuthSessionService } from './auth.session.service';
import { IMembershipStatusResponse, IUser } from '../interfaces';
import { EMembershipStatus } from 'src/users/enums';

@Injectable()
export class AuthUserService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
    private readonly authPasswordService: AuthPasswordService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  // 회원 생성
  async createUser(createUserDto: CreateUserDto): Promise<void> {
    const { email, password, nickname } = createUserDto;

    const existingUser = await this.userRepository.findOne({ where: [{ email }, { nickname }] });

    if (existingUser) {
      if (existingUser.deletedAt !== null) {
        throw new ConflictException('이미 탈퇴한 회원입니다.');
      } else if (existingUser.email === email) {
        throw new ConflictException('이미 가입된 회원입니다.');
      } else if (existingUser.nickname === nickname) {
        throw new ConflictException('이미 존재하는 닉네임입니다.');
      }
    }

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: await this.authPasswordService.createPassword(password),
    });

    await this.userRepository.save(newUser);
  }

  // 이메일로 회원 찾기
  async findUserByEmail(email: string): Promise<UsersEntity | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  // 회원 ID로 회원 찾기
  async findUserByUserId(userId: number): Promise<UsersEntity | undefined> {
    return this.userRepository.findOne({ where: { userId } });
  }

  // 회원 실명과 휴대폰 번호로 회원 찾기
  async findUserByUsernameAndPhone(username: string, phoneNumber: string): Promise<UsersEntity | undefined> {
    return this.userRepository.findOne({ where: { username, phoneNumber } });
  }

  // 회원 실명과 이메일로 회원 찾기
  async findUserByUsernameAndEmail(username: string, email: string): Promise<UsersEntity | undefined> {
    return this.userRepository.findOne({ where: { username, email } });
  }

  // 입력받은 회원정보가 유효한지 확인
  async validateUser(signInUserDto: SignInUserDto): Promise<IUser | null> {
    // 이메일로 회원 찾기
    const user = await this.findUserByEmail(signInUserDto.email);

    if (!user) return null;

    // 비밀번호 일치하는지 확인
    const isPasswordMatched = await this.authPasswordService.matchPassword(signInUserDto.password, user.password);

    if (!isPasswordMatched) return null;

    return user;
  }

  // 회원 ID로 회원 상태 변경
  async updateUserStatusByUserId(userId: number, status: EMembershipStatus) {
    const user = await this.findUserByUserId(userId);
    if (!user) throw new Error('User not found');
    user.membershipStatus = status;
    await this.userRepository.save(user);
  }

  // 회원 ID로 회원 상태 변경
  async updateUserStatusByEmail(email: string, status: EMembershipStatus) {
    const user = await this.findUserByEmail(email);
    if (!user) throw new Error('User not found');
    user.membershipStatus = status;
    await this.userRepository.save(user);
  }

  // 이메일 마스킹
  async maskingEmail(plainEmail: string) {
    const [username, domain] = plainEmail.split('@');
    const visiblePart = username.slice(0, 2);
    const maskedPart = '*'.repeat(username.length - 2);
    return `${visiblePart}${maskedPart}@${domain}`;
  }

  // 회원 탈퇴
  async deleteUser(sessionId: string): Promise<void> {
    const userId = await this.authSessionService.findUserIdFromSession(sessionId);
    const user = await this.userRepository.findOne({ where: { userId } });

    if (!user) {
      throw new NotFoundException('회원을 찾을 수 없습니다.');
    }

    if (user.deletedAt !== null) {
      throw new ConflictException('이미 탈퇴한 회원입니다.');
    }

    user.deletedAt = new Date();
    await this.userRepository.save(user);
  }

  // 회원 ID로 회원 상태 확인
  async checkStatusByUserId(userId: number): Promise<IMembershipStatusResponse> {
    const user = await this.findUserByUserId(userId);
    const status = user.membershipStatus;

    // 사용자 상태에 따른 응답
    switch(status) {
      case EMembershipStatus.PENDING_VERIFICATION:
        return { status: 'pending_verification', message: '회원가입 확인용 이메일을 확인해주세요.' };
      case EMembershipStatus.EMAIL_VERIFIED:
        return { status: 'email_verified', message: '관리자가 회원가입 승인 요청을 검토중입니다.'}
      case EMembershipStatus.APPROVED_MEMBER:
        return { status: 'approved_member', message: '회원가입 승인이 완료된 상태입니다.'}
      case EMembershipStatus.REJECTED_MEMBER:
        return { status: 'rejected', message : '회원가입 승인이 반려되었습니다. 제출한 회원가입 양식과 업로드한 파일을 확인해서 회원가입 요청을 다시해주세요.'};
      default:
          throw new Error('존재하지 않는 사용자 상태입니다.');
      }
    }
}
