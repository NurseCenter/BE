import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from 'src/users/entities/users.entity';
import { SuspensionUserDto } from './dto/suspension-user.dto';
import { DeletionUserDto, UserInfoDto } from './dto';
import { AuthUserService } from 'src/auth/services';
import { UsersDAO } from 'src/users/users.dao';
import { AdminDAO } from './admin.dao';
import { ESuspensionDuration } from './enums';
import dayjs from 'dayjs';
import dataSource from 'data-source';
import { PaginationDto } from './dto/pagination.dto';
import { UserListDto } from './dto/user-list.dto';

@Injectable()
export class AdminService {
    constructor (
        @InjectRepository(UsersEntity)
        private readonly authUserService: AuthUserService,
        private readonly usersDAO: UsersDAO,    
        private readonly adminDAO: AdminDAO
    ) {}
    
    // 회원 계정 탈퇴 처리
    async withdrawUserByAdmin(deletionUserDto: DeletionUserDto){
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        const { userId, deletionReason } = deletionUserDto;

        try {
            await this.authUserService.deleteUser(userId);

            const newDeletedUser = await this.adminDAO.createDeletedUser(userId);
            if (!newDeletedUser) throw new NotFoundException('해당 회원이 존재하지 않습니다.');
    
            newDeletedUser.deletedAt = new Date();
            newDeletedUser.deletionReason = deletionReason;

            await queryRunner.commitTransaction()
        } catch {
            await queryRunner.rollbackTransaction()
        } finally {
            await queryRunner.release()
        }
    }

    // 회원 계정 정지 처리
    async suspendUserByAdmin(suspensionUserDto: SuspensionUserDto) {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        const { userId, suspensionReason, suspensionDuration } = suspensionUserDto;

        try {
            const newSuspendedUser = await this.adminDAO.createSuspendedUser(userId);
            if (!newSuspendedUser) throw new NotFoundException('해당 회원이 존재하지 않습니다.');
    
            newSuspendedUser.suspensionReason = suspensionReason;
            newSuspendedUser.suspensionDuration = suspensionDuration;
            await this.adminDAO.saveSuspendedUser(newSuspendedUser);
    
            const suspensionEndDate = this.calculateSuspensionEndDate(suspensionDuration);
    
            const _newSuspendedUser = await this.usersDAO.findUserByUserId(userId);
            if (_newSuspendedUser) throw new NotFoundException('해당 회원이 존재하지 않습니다.');
    
            _newSuspendedUser.suspensionEndDate = suspensionEndDate;
            await this.usersDAO.saveUser(_newSuspendedUser);

            await queryRunner.commitTransaction()
        } catch {
            await queryRunner.rollbackTransaction()
        } finally {
            await queryRunner.release()
        }
    }

    // 모든 회원 조회
    async fetchAllUsersByAdmin(page: number, pageSize: number = 10): Promise<PaginationDto<UserListDto>> {
        const [users, total] = await this.adminDAO.findUsersWithDetails(page, pageSize);
        const suspendedUsers = await this.adminDAO.findSuspendedUsers();
        const deletedUsers = await this.adminDAO.findDeletedUsers();

        const userList = users.map(user => {
            const suspendedUser = suspendedUsers.find(su => su.userId === user.userId);
            const deletedUser = deletedUsers.find(du => du.userId === user.userId);

            return {
                userId: user.userId,
                nickname: user.nickname,
                email: user.email,
                postCount: Number(user.postCount) || 0,
                commentCount: Number(user.commentCount) || 0,
                createdAt: user.createdAt,
                suspensionStatus: user.suspensionEndDate ? "정지" : "해당없음",
                deletionStatus: user.deletedAt ? "탈퇴" : "해당없음",
                managementReason: suspendedUser?.suspensionReason || deletedUser?.deletionReason || "없음"
            };
        });

        // 전체 페이지 수 계산
        const totalPages = Math.ceil(total / pageSize);

        return {
            totalItems: total,
            totalPages,
            currentPage: page,
            pageSize,
            items: userList
        }
    }

    // 회원 정보 (닉네임, 이메일) 조회
    async fetchUserInfoByAdmin(userId: number){
        const user = await this.usersDAO.findUserByUserId(userId);
        if (!user) throw new NotFoundException("해당 회원이 존재하지 않습니다.")

        const returnUserInfo = { nickname: user.nickname, email: user.email }
        return returnUserInfo as UserInfoDto;
    }

    private calculateSuspensionEndDate(duration: ESuspensionDuration): Date {
        const now = dayjs();

        switch(duration) {
            case ESuspensionDuration.ONE_WEEK:
                return now.add(1, 'week').toDate();
            case ESuspensionDuration.TWO_WEEKS:
                return now.add(2, 'week').toDate();
            case ESuspensionDuration.THREE_WEEKS:
                return now.add(3, 'week').toDate();
            case ESuspensionDuration.FOUR_WEEKS:
                return now.add(4, 'week').toDate();
            default:
                throw new NotFoundException("입력된 기간이 유효하지 않습니다.")
        }
    }
}
