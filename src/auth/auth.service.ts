import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

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

    // 회원 탈퇴
    // async deleteUser() {}
}
