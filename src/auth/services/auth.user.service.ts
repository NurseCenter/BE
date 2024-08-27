import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { UsersEntity } from "src/users/entities/users.entity";
import { Repository } from "typeorm";
import { CreateUserDto, SignInUserDto } from "../dto";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthPasswordService } from "./auth.password.service";
import { AuthSessionService } from "./auth.session.service";
import { IUser } from "../interfaces";
import { EMembershipStatus } from "src/users/enums";

@Injectable()
export class AuthUserService{
    constructor(
        @InjectRepository(UsersEntity)
        private readonly userRepository: Repository<UsersEntity>,
        private readonly authPasswordService: AuthPasswordService,
        private readonly authSessionService: AuthSessionService,
    ){}
    
    // 회원 생성
    async createUser(createUserDto: CreateUserDto): Promise<void> {
        const { email, password } = createUserDto;
    
        const existingUser = await this.userRepository.findOne({ where: { email } });
    
        if (existingUser) {
          if (existingUser.deletedAt !== null) {
            throw new ConflictException('이미 탈퇴한 회원입니다.');
          } else {
            throw new ConflictException('이미 가입된 회원입니다.');
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
      async findUserByUserId(userId: string): Promise<UsersEntity | undefined> {
        return this.userRepository.findOne({ where: { userId } });
      }

    // 입력받은 회원정보가 유효한지 확인
    async validateUser(signInUserDto: SignInUserDto): Promise<IUser | null>{
        // 이메일로 회원 찾기
        const user = await this.findUserByEmail(signInUserDto.email)

        if (!user) return null;

        // 비밀번호 일치하는지 확인
        const isPasswordMatched = await this.authPasswordService.matchPassword(signInUserDto.password, user.password)

        if (!isPasswordMatched) return null;

        return user;
    }

    // 회원 ID로 회원 상태 변경
    async updateUserStatus(userId: string, status: EMembershipStatus) {
      const user = await this.findUserByUserId(userId);
      if (!user) throw new Error('User not found');
      user.membershipStatus = status;
      await this.userRepository.save(user);
    }
    
      // 회원 탈퇴
      async deleteUser(sessionId: string): Promise<void> {
        const userId = await this.authSessionService.getUserIdFromSession(sessionId);

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
}