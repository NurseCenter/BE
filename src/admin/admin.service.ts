import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';
import { SuspensionUserDto } from './dto/suspension-user.dto';
import { UserInfoDto } from './dto';

@Injectable()
export class AdminService {
    constructor (
        @InjectRepository(UsersEntity)
        private readonly usersRepository: Repository<UsersEntity>) {}

    // 회원 계정 탈퇴 처리
    async withdrawUserByAdmin(userId: number){
        const user = await this.usersRepository.findOne({ where: { userId }});
        
        if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

        user.deletedAt = new Date();
        await this.usersRepository.save(user);
    }

    // 회원 계정 정지 처리
    async suspendUserByAdmin(suspensionUserDto: SuspensionUserDto) {
    }

    // 모든 회원 조회
    async fetchAllUsersByAdmin() {}

    // 회원 정보 (닉네임, 이메일) 조회
    async fetchUserInfoByAdmin(userId: number){
        const user = await this.usersRepository.findOne({ where: { userId }});
        if (!user) throw new NotFoundException("해당 회원이 존재하지 않습니다.")

        const returnUserInfo = { nickname: user.nickname, email: user.email }
        return returnUserInfo as UserInfoDto;
    }


}
