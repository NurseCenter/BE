import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
import { ApprovalDto } from './dto/approval.dto';
import { EMembershipStatus } from 'src/users/enums';

@Injectable()
export class AdminService {
  constructor(
    private readonly authUserService: AuthUserService,
    private readonly usersDAO: UsersDAO,
    private readonly adminDAO: AdminDAO,
  ) {}

  // 회원 계정 탈퇴 처리
  async withdrawUserByAdmin(deletionUserDto: DeletionUserDto) {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const { userId, deletionReason } = deletionUserDto;

    try {
      await this.authUserService.deleteUser(userId);

      const newDeletedUser = await this.adminDAO.createDeletedUser(userId);
      if (!newDeletedUser) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

      newDeletedUser.deletedAt = new Date();
      newDeletedUser.deletionReason = deletionReason;

      await queryRunner.commitTransaction();
    } catch {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  // 회원 계정 정지 처리
  async suspendUserByAdmin(suspensionUserDto: SuspensionUserDto) {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

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

      await queryRunner.commitTransaction();
    } catch {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  // 모든 회원 조회
  async fetchAllUsersByAdmin(pageNumber: number, pageSize: number = 10): Promise<PaginationDto<UserListDto>> {
    const [users, total] = await this.adminDAO.findUsersWithDetails(pageNumber, pageSize);
    const suspendedUsers = await this.adminDAO.findSuspendedUsers();
    const deletedUsers = await this.adminDAO.findDeletedUsers();

    const userList = users.map((user) => {
      const suspendedUser = suspendedUsers.find((su) => su.userId === user.userId);
      const deletedUser = deletedUsers.find((du) => du.userId === user.userId);

      return {
        userId: user.userId,
        nickname: user.nickname,
        email: user.email,
        postCount: Number(user.postCount) || 0,
        commentCount: Number(user.commentCount) || 0,
        createdAt: user.createdAt,
        suspensionStatus: user.suspensionEndDate ? '정지' : '해당없음',
        deletionStatus: user.deletedAt ? '탈퇴' : '해당없음',
        managementReason: suspendedUser?.suspensionReason || deletedUser?.deletionReason || '없음',
      };
    });

    // 전체 페이지 수 계산
    const totalPages = Math.ceil(total / pageSize);

    return {
      totalItems: total,
      totalPages,
      currentPage: pageNumber,
      pageSize,
      items: userList,
    };
  }

  // 회원 정보 (닉네임, 이메일) 조회
  async fetchUserInfoByAdmin(userId: number) {
    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

    const returnUserInfo = { nickname: user.nickname, email: user.email };
    return returnUserInfo as UserInfoDto;
  }

  // 관리자 특정 회원 승인
  async processUserApproval(approvalDto: ApprovalDto) {
    const { userId, isApproved } = approvalDto;
    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

    // 1 : 이메일 인증 완료 상태
    const isEmailVerified = user.membershipStatus === EMembershipStatus.EMAIL_VERIFIED;
    // 2 : 비회원 또는 이메일 인증 대기 상태
    const isNonMemberOrPending =
      user.membershipStatus === (EMembershipStatus.NON_MEMBER || EMembershipStatus.PENDING_VERIFICATION);
    // 3 : 이미 정회원 상태
    const isAlreadyApproved = user.membershipStatus === EMembershipStatus.APPROVED_MEMBER;

    if (isApproved) {
      if (isEmailVerified) {
        user.membershipStatus = EMembershipStatus.APPROVED_MEMBER;
      } else if (isNonMemberOrPending) {
        throw new BadRequestException('아직 이메일 인증을 완료하지 않은 회원입니다.');
      } else if (isAlreadyApproved) {
        throw new BadRequestException('이미 정회원으로 처리된 회원입니다.');
      }
    } else {
      user.rejected = true;
    }

    await this.usersDAO.saveUser(user);
    return { message: '회원 승인 처리가 완료되었습니다.', membershipStatus: user.membershipStatus };
  }

  // 정지 날짜 계산
  private calculateSuspensionEndDate(duration: ESuspensionDuration): Date {
    const now = dayjs();

    switch (duration) {
      case ESuspensionDuration.ONE_WEEK:
        return now.add(1, 'week').toDate();
      case ESuspensionDuration.TWO_WEEKS:
        return now.add(2, 'week').toDate();
      case ESuspensionDuration.THREE_WEEKS:
        return now.add(3, 'week').toDate();
      case ESuspensionDuration.FOUR_WEEKS:
        return now.add(4, 'week').toDate();
      default:
        throw new NotFoundException('입력된 기간이 유효하지 않습니다.');
    }
  }

  // 회원가입 승인 화면 보여주기
  async showUserApprovals(pageNumber: number, pageSize: number = 10) {
    try {
      const [users, total] = await this.adminDAO.findPendingAndRejectVerifications(pageNumber, pageSize);

      const items = users.map((user) => ({
        userId: user.userId,
        nickname: user.nickname,
        email: user.email,
        createdAt: user.createdAt,
        studentStatus: user.membershipStatus,
        certificationDocumentUrl: user.certificationDocumentUrl,
        status: user.rejected ? '승인거절' : '승인대기',
      }));

      return {
        items,
        totalItems: total,
        tatalPages: Math.ceil(total / pageSize),
        currentPage: pageNumber,
      };
    } catch (error) {
      console.error('회원가입 승인 화면 데이터를 가져오는 중 에러 발생: ', error);
    }
  }

  // 게시물 관리 페이지 데이터 조회
  async getAllPosts(pageNumber: number, pageSize: number): Promise<{ items: any[], totalItems: number, totalPages: number, currentPage: number }> {
    const [posts, total] = await this.adminDAO.findAllPosts(pageNumber, pageSize);

    const items = posts.map(post => ({
      postId: post.postId, // 게시물 ID
      boardType: post.boardType, // 카테고리
      title: post.title,  // 제목
      userId: post.userId,  // 작성자 --> 조인해서 닉네임으로 변경 필요
      createdAt: post.createdAt, // 작성일
    }));

    return {
      items,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: pageNumber,
    };
  }

  // 특정 게시물 삭제
  async deletePost(postId: number): Promise<void> {
    await this.adminDAO.deletePost(postId);
  }
}
