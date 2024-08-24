import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { SignInUserDto } from './dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UsersEntity)
        private readonly userRepository: Repository<UsersEntity>
    ){}
    // 회원 생성
    async createUser(createUserDto: CreateUserDto): Promise<void>{
        // 입력받은 평문 비밀번호를 해시화
        const hashedPassword = await this.createPassword(createUserDto.password);

        // 이미 존재하는 회원인지 확인
        const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email }})

        if (existingUser) {
            if (existingUser.deletedAt !== null) {
                throw new ConflictException('이미 탈퇴한 회원입니다.')
            } else {
                throw new ConflictException('이미 가입된 회원입니다.');
            }
        }

        // 새로운 회원 생성
        const newUser = this.userRepository.create({
            ...createUserDto,
            password: hashedPassword,
        })

        // 생성한 회원을 DB에 저장
        await this.userRepository.save(newUser);
    }

    // 비밀번호 생성
    async createPassword(plainPassword: string): Promise<string> {
        const hashedPassword = await bcrypt.hash(plainPassword, 15);
        return hashedPassword;
    }

    // 비밀번호 일치 검사
    async matchPassword(inputPassword: string, storedPassword: string): Promise<boolean>{
        const isPasswordMatch = await bcrypt.compare(inputPassword, storedPassword);
        return isPasswordMatch;
    }

    // 이메일로 회원 찾기
    async findUserByEmail(email: string): Promise<UsersEntity | undefined> {
        return this.userRepository.findOne({
            where: { email }
        })
    }

    // 회원 ID로 회원 찾기
    async findUserByUserId(userId: string): Promise<UsersEntity | undefined> {
        return this.userRepository.findOne({
            where: { userId }
        })
    }

    // // 세션 ID에서 사용자 ID 찾기
    // async getUserIdFromSession(sessionId: string): Promise<UsersEntity | undefined> {
    //     return this.userRepository.findOne({
    //         where: { }
    //     })
    // }

    // 입력받은 회원정보가 유효한지 확인
    async validateUser(signInUserDto: SignInUserDto): Promise<boolean>{
        // 이메일로 회원 찾기
        const user = await this.findUserByEmail(signInUserDto.email)

        if (!user) return false;

        // 비밀번호 일치하는지 확인
        const isPasswordMatched = await this.matchPassword(signInUserDto.password, user.password)

        return isPasswordMatched;
    }

    // 회원 탈퇴
    async deleteUser(userId: string): Promise<void> {
     const user = await this.userRepository.findOne({ where: {userId} });

     // 사용자가 존재하지 않는 경우
     if (!user) {
        throw new NotFoundException('User not found');
     }

     // 이미 탈퇴한 사용자인지 확인
     if (user.deletedAt !== null) {
        throw new ConflictException('User is already removed');
    }

    // 탈퇴일자를 현재 날짜로 지정
    user.deletedAt = new Date();

    // 변경사항 저장
    await this.userRepository.save(user);
    }
}
