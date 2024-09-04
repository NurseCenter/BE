import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';
import { SuspensionUserDto } from './dto/suspension-user.dto';
import { UserInfoDto } from './dto';
import { AuthUserService } from 'src/auth/services';
import { UsersDAO } from 'src/users/users.dao';

@Injectable()
export class AdminService {
    constructor (
        @InjectRepository(UsersEntity)
        private readonly authUserService: AuthUserService,
        private readonly usersDAO: UsersDAO    
    ) {}

    // 회원 계정 탈퇴 처리
    async withdrawUserByAdmin(userId: number){
        await this.authUserService.deleteUser(userId);
    }

    // 회원 계정 정지 처리
    async suspendUserByAdmin(suspensionUserDto: SuspensionUserDto) {
    }

    // 모든 회원 조회
    async fetchAllUsersByAdmin() {}

    // 회원 정보 (닉네임, 이메일) 조회
    async fetchUserInfoByAdmin(userId: number){
        const user = await this.usersDAO.findUserByUserId(userId);
        if (!user) throw new NotFoundException("해당 회원이 존재하지 않습니다.")

        const returnUserInfo = { nickname: user.nickname, email: user.email }
        return returnUserInfo as UserInfoDto;
    }
}
