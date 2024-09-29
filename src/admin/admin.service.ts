import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SuspensionUserDto } from './dto/suspension-user.dto';
import { AuthSignInService, AuthUserService } from 'src/auth/services';
import { UsersDAO } from 'src/users/users.dao';
import { EmanagementStatus, ESuspensionDuration } from './enums';
import * as dayjs from 'dayjs';
import { ECommentType, EMembershipStatus } from 'src/users/enums';
import { ApprovalUserDto } from './dto';
import { IPaginatedResponse } from 'src/common/interfaces';
import { IUserList, IUserInfo, IApprovalUserList, IPostList } from './interfaces';
import { CommentsDAO } from 'src/comments/comments.dao';
import { RepliesDAO } from 'src/replies/replies.dao';
import { PostsDAO } from 'src/posts/posts.dao';
import { SignInUserDto } from 'src/auth/dto';
import { AuthService } from 'src/auth/auth.service';
import { Request, Response } from 'express';
import { RejectedUsersDAO } from './dao/rejected-users.dao';
import { DeletedUsersDAO } from './dao/delete-users.dao';
import { SuspendedUsersDAO } from './dao/suspended-users.dao';

@Injectable()
export class AdminService {
  constructor(
    private readonly authUserService: AuthUserService,
    private readonly authSignInService: AuthSignInService,
    private readonly authService: AuthService,
    private readonly usersDAO: UsersDAO,
    private readonly suspendedUsersDAO: SuspendedUsersDAO,
    private readonly deletedUsersDAO: DeletedUsersDAO,
    private readonly postsDAO: PostsDAO,
    private readonly commentsDAO: CommentsDAO,
    private readonly repliesDAO: RepliesDAO,
    private readonly rejectedUsersDAO: RejectedUsersDAO,
  ) {}

  // 관리자 계정으로 로그인
  async signInByAdmin(signInUserDto: SignInUserDto, req: Request, res: Response): Promise<void> {
    // 1. 관리자 계정 여부 확인
    const isAdmin = await this.authSignInService.checkIfAdmin(signInUserDto.email);

    if (!isAdmin) {
      throw new ForbiddenException('관리자 계정이 아닙니다.');
    } else {
      // 2. 일반 로그인 처리
      await this.authService.signIn(signInUserDto, req, res);
    }
  }

  // 회원 계정 탈퇴 처리
  async withdrawUserByAdmin(userId: number, deletionReason: string): Promise<void> {
    // 사용자 조회
    const user = await this.usersDAO.findUserByUserId(userId);

    if (!user) {
      throw new NotFoundException('해당 회원이 존재하지 않습니다.');
    }

    if (user && user.deletedAt !== null) {
      throw new ConflictException('이미 탈퇴 처리된 회원입니다.');
    }

    // 사용자 삭제 처리
    await this.authUserService.deleteUser(userId);

    // 이미 삭제된 사용자 확인
    const existingDeletedUser = await this.deletedUsersDAO.findDeletedUserByUserId(userId);
    if (existingDeletedUser && existingDeletedUser?.deletedAt !== null) {
      throw new ConflictException('이미 탈퇴처리가 된 회원입니다.');
    }

    // deleted_users에 새로운 엔티티 생성
    const newDeletedUser = await this.deletedUsersDAO.createDeletedUser(userId);
    await this.deletedUsersDAO.saveDeletedUser(newDeletedUser);
    if (!newDeletedUser) {
      throw new NotFoundException('해당 회원 탈퇴 처리 중 오류가 발생하였습니다.');
    }

    newDeletedUser.userId = userId;
    newDeletedUser.deletionReason = deletionReason;
    await this.deletedUsersDAO.saveDeletedUser(newDeletedUser);
  }

  // 회원 탈퇴 취소
  async cancelWithdrawal(userId: number): Promise<void> {
    const deletedUser = await this.deletedUsersDAO.findDeletedUserByUserId(userId);
    if (!deletedUser) throw new NotFoundException('해당 회원의 탈퇴 기록을 찾을 수 없습니다.');
    deletedUser.deletedAt = new Date();
    await this.deletedUsersDAO.saveDeletedUser(deletedUser);

    const user = await this.usersDAO.findUserByUserIdForAdmin(userId);
    if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');
    user.deletedAt = null;
    await this.usersDAO.saveUser(user);
  }

  // 회원 계정 정지 처리
  async suspendUserByAdmin(suspensionUserDto: SuspensionUserDto): Promise<{ userId: number; suspensionEndDate: Date }> {
    const { userId, suspensionReason, suspensionDuration } = suspensionUserDto;

    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

    const alreadySuspendedUser = await this.suspendedUsersDAO.findSuspendedUserByUserId(userId);
    const suspensionEndDate = this.calculateSuspensionEndDate(suspensionDuration);

    // 1. 이미 정지처리된 회원
    if (alreadySuspendedUser && alreadySuspendedUser.deletedAt === null) {
      throw new ConflictException('이미 활동 정지 처리된 회원입니다.');
    }

    // 2. 정지된 회원테이블에 있는데 deletedAt이 날짜 (정지해제된 경우)
    // => 정지 누적 카운트를 1 증가, 기존 내역을 덮어씌우기
    if (alreadySuspendedUser && alreadySuspendedUser.deletedAt !== null) {
      alreadySuspendedUser.deletedAt = null; // 초기화 (정지상태로)
      alreadySuspendedUser.suspensionReason = suspensionReason;
      alreadySuspendedUser.suspensionDuration = suspensionDuration;
      alreadySuspendedUser.suspensionCount += 1;
      alreadySuspendedUser.suspensionEndDate = suspensionEndDate;
      await this.suspendedUsersDAO.saveSuspendedUser(alreadySuspendedUser);
    } else {
      // 3. 기존 내역이 없는 회원 => 새로 생성
      const newSuspendedUser = await this.suspendedUsersDAO.createSuspendedUser(userId);
      if (!newSuspendedUser) {
        throw new NotFoundException('정지된 회원 목록에 새 회원을 추가하는 중 오류가 발생하였습니다.');
      }
      newSuspendedUser.suspensionReason = suspensionReason;
      newSuspendedUser.suspensionDuration = suspensionDuration;
      newSuspendedUser.suspensionCount = 1;
      newSuspendedUser.suspensionEndDate = suspensionEndDate;
      await this.suspendedUsersDAO.saveSuspendedUser(newSuspendedUser);
    }

    // Users 테이블에 회원 정보 업데이트
    user.suspensionEndDate = suspensionEndDate;
    await this.usersDAO.saveUser(user);

    return { userId: user.userId, suspensionEndDate: user.suspensionEndDate };
  }

  // 회원 계정 정지 취소
  async cancelSuspension(userId: number): Promise<{ message: string; userId: number }> {
    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

    user.suspensionEndDate = null;
    await this.usersDAO.saveUser(user);

    const suspendedUser = await this.suspendedUsersDAO.findSuspendedUserByUserId(userId);
    if (!suspendedUser) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

    suspendedUser.suspensionEndDate = new Date();
    suspendedUser.deletedAt = new Date();
    await this.suspendedUsersDAO.saveSuspendedUser(suspendedUser);

    return { message: '회원 정지 취소가 완료되었습니다.', userId };
  }

  // 모든 회원 조회
  async fetchAllUsersByAdmin(page: number, limit: number = 10): Promise<IPaginatedResponse<IUserList>> {
    const [users, total] = await this.usersDAO.findUsersWithDetails(page, limit);
    const suspendedUsers = await this.suspendedUsersDAO.findSuspendedUsers();
    const deletedUsers = await this.deletedUsersDAO.findDeletedUsers();

    const userList = users.map((user) => {
      const suspendedUser = suspendedUsers.find((su) => su.userId === user.user_userId);
      const deletedUser = deletedUsers.find((du) => du.userId === user.user_userId);

      // 관리 상태 결정
      let managementStatus: EmanagementStatus = EmanagementStatus.NONE; // 없음(기본값)
      let managementReason = '없음';

      if (deletedUser) {
        managementStatus = EmanagementStatus.WITHDRAWN; // 탈퇴
        managementReason = deletedUser.deletionReason || '없음';
      } else if (suspendedUser) {
        managementStatus = EmanagementStatus.STOPPED; // 정지
        managementReason = suspendedUser.suspensionReason || '없음';
      }

      return {
        userId: user.user_userId, // 회원 ID (렌더링 X)
        nickname: user.user_nickname, // 닉네임
        email: user.user_email, // 이메일
        postCount: Number(user.postCount) || 0, // 게시물 수
        commentCount: Number(user.commentCount) || 0, // 댓글 수
        createdAt: user.user_createdAt, // 가입일
        managementStatus, // 정지 또는 탈퇴 여부 (정지, 탈퇴, 해당없음)
        managementReason, // 관리 사유
      };
    });

    // 전체 페이지 수 계산
    const totalPages = Math.ceil(total / limit);

    return {
      items: userList,
      totalItems: total,
      totalPages,
      currentPage: page,
    };
  }

  // 회원 정보 (닉네임, 이메일) 조회
  async fetchUserInfoByAdmin(userId: number): Promise<IUserInfo> {
    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

    const returnUserInfo = { userId: user.userId, nickname: user.nickname, email: user.email };
    return returnUserInfo as IUserInfo;
  }

  // 관리자 특정 회원 정회원 승인
  async processUserApproval(
    approvalDto: ApprovalUserDto,
  ): Promise<{ message: string; userId: number; membershipStatus: EMembershipStatus }> {
    const { userId } = approvalDto;
    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

    const membershipStatus = user.membershipStatus;

    if (membershipStatus === EMembershipStatus.EMAIL_VERIFIED) {
      const user = await this.usersDAO.findUserByUserId(userId);
      const rejectedUser = await this.rejectedUsersDAO.findRejectedUserByUserId(userId);

      // 이미 정회원 거절이 된 회원의 경우
      if (rejectedUser && user.rejected) {
        rejectedUser.deletedAt = new Date();
        await this.rejectedUsersDAO.saveRejectedUser(rejectedUser);
        user.rejected = false;
        await this.usersDAO.saveUser(user);
      }

      user.membershipStatus = EMembershipStatus.APPROVED_MEMBER;
      await this.usersDAO.saveUser(user);
      return {
        message: '정회원 승인이 완료되었습니다.',
        userId: user.userId,
        membershipStatus: user.membershipStatus,
      };
    } else if (
      membershipStatus === EMembershipStatus.NON_MEMBER ||
      membershipStatus === EMembershipStatus.PENDING_VERIFICATION
    ) {
      throw new BadRequestException('아직 이메일 인증을 완료하지 않은 회원입니다.');
    } else if (membershipStatus === EMembershipStatus.APPROVED_MEMBER) {
      throw new BadRequestException('이미 정회원으로 처리된 회원입니다.');
    }
  }

  // 관리자 특정 회원 정회원 거절
  async processUserReject(
    userId: number,
    rejectedReason: string,
  ): Promise<{ message: string; userId: number; rejectedReason: string }> {
    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

    user.rejected = true;
    const rejectedUser = await this.rejectedUsersDAO.createRejectedUser(userId, rejectedReason);

    await this.rejectedUsersDAO.saveRejectedUser(rejectedUser);
    await this.usersDAO.saveUser(user);

    return { message: '정회원 승인이 거절되었습니다.', userId, rejectedReason };
  }

  async sendRejectionEmail(
    userId: number,
    rejectedReason: string,
  ): Promise<{ message: string; userId: number; rejectedReason: string }> {
    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

    
    return { message: '정회원 승인 거절 메시지가 해당 회원에게 발송되었습니다.', userId, rejectedReason };
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
  async showUserApprovals(page: number, limit: number = 10): Promise<IPaginatedResponse<IApprovalUserList>> {
    try {
      const [users, total] = await this.usersDAO.findPendingAndRejectVerifications(page, limit);

      const items = users.map((user) => ({
        userId: user.userId, // 회원 ID (렌더링 X)
        nickname: user.nickname, // 닉네임
        email: user.email, // 이메일
        createdAt: user.createdAt, // 가입 날짜
        membershipStatus: user.membershipStatus, // 현재 회원상태
        certificationDocumentUrl: user.certificationDocumentUrl, // 첨부파일
        status: user.rejected ? '승인거절' : '승인대기', // 상태
      }));

      return {
        items,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error('회원가입 승인 화면 데이터를 가져오는 중 에러 발생: ', error);
    }
  }

  // 게시물 관리 페이지 데이터 조회
  async getAllPosts(page: number, limit: number, search: string): Promise<IPaginatedResponse<IPostList>> {
    const [posts, total] = await this.postsDAO.findAllPostsByAdmin(page, limit, search);

    const items = posts.map((post) => ({
      postId: post.postId, // 게시물 ID
      boardType: post.boardType, // 카테고리
      title: post.title, // 제목
      author: post.user.nickname, // 작성자
      createdAt: post.createdAt, // 작성일
    }));

    return {
      items,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // 특정 게시물 삭제
  async deletePost(postId: number): Promise<void> {
    const result = await this.postsDAO.deletePost(postId);
    if (result.affected === 0) {
      throw new NotFoundException(`게시물 삭제 중 에러가 발생하였습니다.`);
    }
  }

  // 댓글 및 답글 조회
  async findAllCommentsAndReplies(page: number = 1, limit: number = 10): Promise<IPaginatedResponse<any>> {
    const skip = (page - 1) * limit;

    // 댓글과 답글을 모두 조회
    const [comments, replies] = await Promise.all([
      this.commentsDAO.findAllComments(),
      this.repliesDAO.findAllReplies(),
    ]);

    // 댓글과 답글을 합침
    const combinedPromises = comments.map(async (comment) => {
      const post = await this.postsDAO.findPostEntityByPostId(comment.postId);

      return {
        id: comment.commentId, // 댓글 ID
        type: ECommentType.COMMENT, // 댓글 표시
        postId: post.postId || null,
        category: post.boardType || null, // 게시물 카테고리
        postTitle: post.title || null, // 게시물 제목
        content: comment.content, // 댓글 내용
        nickname: comment.nickname, // 작성자 닉네임
        createdAt: new Date(comment.createdAt), // 작성일
      };
    });

    const replyPromises = replies.map(async (reply) => {
      const comment = await this.commentsDAO.findCommentById(reply.commentId);
      const post = await this.postsDAO.findPostEntityByPostId(comment.postId);

      return {
        id: reply.replyId, // 답글 ID
        type: ECommentType.REPLY, // 답글 표시
        postId: post.postId || null,
        category: post.boardType || null, // 게시물 카테고리
        postTitle: post.title || null, // 게시물 제목
        content: reply.content, // 답글 내용
        nickname: reply.nickname, // 작성자 닉네임
        createdAt: new Date(reply.createdAt), // 작성일
      };
    });

    // 모든 댓글과 답글에 대한 Promise를 실행
    const combined = await Promise.all([...combinedPromises, ...replyPromises]);

    // 작성일자 기준으로 정렬
    combined.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // 페이지네이션 처리
    const paginatedResults = combined.slice(skip, skip + limit);

    return {
      items: paginatedResults,
      totalItems: combined.length,
      totalPages: Math.ceil(combined.length / limit),
      currentPage: page,
    };
  }

  // 댓글 또는 답글 삭제
  async deleteCommentOrReplyById(type: ECommentType, commentId: number): Promise<void> {
    switch (type) {
      case ECommentType.COMMENT:
        await this.commentsDAO.deleteComment(commentId);
      case ECommentType.REPLY:
        await this.repliesDAO.deleteReply(commentId);
    }
  }
}
