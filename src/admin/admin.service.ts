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
import { EMembershipStatus } from 'src/users/enums';
import { ApprovalUserDto, DeletionUserDto } from './dto';
import { DeletedUsersDAO, SuspendedUsersDAO } from './dao';
import { IPaginatedResponse } from 'src/common/interfaces';
import { IUserList, IUserInfo, IApprovalUserList, IPostList, ICommentOrReply } from './interfaces';
import { CommentsDAO } from 'src/comments/comments.dao';
import { RepliesDAO } from 'src/replies/replies.dao';
import { PostsDAO } from 'src/posts/posts.dao';
import { SignInUserDto } from 'src/auth/dto';
import { AuthService } from 'src/auth/auth.service';
import { Request, Response } from 'express';

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
  ) {}

  // 관리자 계정으로 로그인
  async signInByAdmin(signInUserDto: SignInUserDto, req: Request, res: Response) {
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
  async withdrawUserByAdmin(deletionUserDto: DeletionUserDto): Promise<void> {
    const { userId, deletionReason } = deletionUserDto;
    console.log('userId', userId, 'deletionReason', deletionReason);

    // 사용자 조회
    const user = await this.usersDAO.findUserByUserId(userId);

    if (!user) {
      throw new NotFoundException('해당 회원이 존재하지 않습니다.');
    }

    // 사용자 삭제 처리
    await this.authUserService.deleteUser(userId);

    // 이미 삭제된 사용자 확인
    const existingDeletedUser = await this.deletedUsersDAO.findDeletedUserByUserId(userId);
    if (existingDeletedUser?.deletedAt !== null) {
      throw new ConflictException('이미 탈퇴처리가 된 회원입니다.');
    }

    // 새 삭제 사용자 생성
    const newDeletedUser = await this.deletedUsersDAO.createDeletedUser(userId);
    if (!newDeletedUser) {
      throw new NotFoundException('해당 회원 탈퇴 처리 중 오류가 발생하였습니다.');
    }

    newDeletedUser.userId = userId;
    newDeletedUser.deletionReason = deletionReason;
    newDeletedUser.deletedAt = new Date(); // 현재 날짜로 설정
    await this.deletedUsersDAO.saveDeletedUser(newDeletedUser);
  }

  // 회원 탈퇴 취소
  async cancelWithdrawal(userId: number): Promise<void> {
    const deletedUser = await this.deletedUsersDAO.findDeletedUserByUserId(userId);
    if (!deletedUser) throw new NotFoundException('해당 회원의 탈퇴 기록을 찾을 수 없습니다.');
    deletedUser.deletedAt = null;
    await this.deletedUsersDAO.saveDeletedUser(deletedUser);

    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');
    user.deletedAt = null;
    await this.usersDAO.saveUser(user);
  }

  // 회원 계정 정지 처리
  async suspendUserByAdmin(suspensionUserDto: SuspensionUserDto): Promise<void> {
    const { userId, suspensionReason, suspensionDuration } = suspensionUserDto;

    try {
      const user = await this.usersDAO.findUserByUserId(userId);
      if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

      const newSuspendedUser = await this.suspendedUsersDAO.createSuspendedUser(userId);
      if (!newSuspendedUser)
        throw new NotFoundException('정지된 회원 목록에 새 회원을 추가하는 중 오류가 발생하였습니다.');

      newSuspendedUser.suspensionReason = suspensionReason;
      newSuspendedUser.suspensionDuration = suspensionDuration;
      await this.suspendedUsersDAO.saveSuspendedUser(newSuspendedUser);

      const suspensionEndDate = this.calculateSuspensionEndDate(suspensionDuration);

      user.suspensionEndDate = suspensionEndDate;
      await this.usersDAO.saveUser(user);

      newSuspendedUser.suspensionEndDate = suspensionEndDate;
      await this.suspendedUsersDAO.saveSuspendedUser(newSuspendedUser);
    } catch (error) {
      console.error('실행중 에러', error);
    }
  }

  // 회원 계정 정지 취소
  async cancelSuspension(userId: number): Promise<{ message: string }> {
    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) throw new NotFoundException('해당 사용자를 찾을 수 없습니다.');

    user.suspensionEndDate = null;
    await this.usersDAO.saveUser(user);

    const suspendedUser = await this.suspendedUsersDAO.findSuspendedUserByUserId(userId);
    if (!suspendedUser) throw new NotFoundException('해당 사용자를 찾을 수 없습니다.');

    suspendedUser.deletedAt = new Date();
    await this.suspendedUsersDAO.saveSuspendedUser(suspendedUser);

    return { message: '회원 정지 취소가 완료되었습니다.' };
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
  async fetchUserInfoByAdmin(userId: number) {
    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

    const returnUserInfo = { nickname: user.nickname, email: user.email };
    return returnUserInfo as IUserInfo;
  }

  // 관리자 특정 회원 승인
  async processUserApproval(
    approvalDto: ApprovalUserDto,
  ): Promise<{ message: string; membershipStatus: EMembershipStatus }> {
    const { userId, isApproved } = approvalDto;
    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

    // 1 : 이메일 인증 완료 상태
    const isEmailVerified = user.membershipStatus === EMembershipStatus.EMAIL_VERIFIED;
    // 2 : 비회원 또는 이메일 인증 대기 상태
    const isNonMemberOrPending =
      user.membershipStatus === EMembershipStatus.NON_MEMBER ||
      user.membershipStatus === EMembershipStatus.PENDING_VERIFICATION;
    // 3 : 이미 정회원 상태
    const isAlreadyApproved = user.membershipStatus === EMembershipStatus.APPROVED_MEMBER;

    if (isApproved) {
      if (isEmailVerified) {
        user.membershipStatus = EMembershipStatus.APPROVED_MEMBER;
        await this.usersDAO.saveUser(user);
        return { message: '회원 가입 승인이 완료되었습니다.', membershipStatus: user.membershipStatus };
      } else if (isNonMemberOrPending) {
        throw new BadRequestException('아직 이메일 인증을 완료하지 않은 회원입니다.');
      } else if (isAlreadyApproved) {
        throw new BadRequestException('이미 정회원으로 처리된 회원입니다.');
      }
    } else {
      user.rejected = true;
      await this.usersDAO.saveUser(user);
      return { message: '회원 가입 승인이 거절되었습니다.', membershipStatus: user.membershipStatus };
    }
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
    const [posts, total] = await this.postsDAO.findAllPosts(page, limit, search);

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
    const post = await this.postsDAO.deletePost(postId);

    if (!post) {
      throw new NotFoundException('게시물이 존재하지 않거나 이미 삭제되었습니다.');
    }
  }

  // 댓글 및 답글 조회
  async findAllCommentsAndReplies(page: number, limit: number): Promise<ICommentOrReply[]> {
    // 댓글과 답글을 모두 조회
    const [comments, replies] = await Promise.all([
      this.commentsDAO.findAllComments(),
      this.repliesDAO.findAllReplies(),
    ]);

    // 댓글과 답글을 합침
    const combined = [
      ...comments.map((comment) => ({
        id: comment.commentId, // 댓글 ID
        category: comment.boardType, // 게시물 카테고리
        postTitle: comment.title, // 게시물 제목
        content: comment.content, // 댓글 내용
        nickname: comment.nickname, // 작성자 닉네임
        createdAt: new Date(comment.createdAt), // 작성일
      })),
      ...replies.map((reply) => ({
        id: reply.replyId, // 답글 ID
        category: reply.boardType, // 게시물 카테고리
        postTitle: reply.title, // 게시물 제목
        content: reply.content, // 답글 내용
        nickname: reply.nickname, // 작성자 닉네임
        createdAt: new Date(reply.createdAt), // 작성일
      })),
    ];

    // 작성일자 기준으로 정렬
    combined.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // 페이지네이션 처리
    const skip = (page - 1) * limit;
    return combined.slice(skip, skip + limit);
  }

  // 특정 댓글 또는 답글 조회
  async findCommentOrReplyById(id: number) {
    // const comment = await this.commentsDAO.findCommentById(id);
    // if (comment) {
    //   return {
    //     id: comment.commentId, // 댓글 ID
    //     category: comment.boardType, // 게시물 카테고리
    //     postTitle: comment.post.title, // 게시물 제목
    //     content: comment.content, // 댓글 내용
    //     nickname: comment.user.nickname, // 작성자 닉네임
    //     createdAt: new Date(comment.createdAt), // 작성일
    //   };
    // }
    // const reply = await this.repliesDAO.findReplyById(id);
    // if (reply) {
    //   return {
    //     id: reply.replyId, // 답글 ID
    //     category: reply.post.boardType, // 게시물 카테고리
    //     postTitle: reply.post.title, // 게시물 제목
    //     content: reply.content, // 답글 내용
    //     nickname: reply.user.nickname, // 작성자 닉네임
    //     createdAt: new Date(reply.createdAt), // 작성일
    //   };
    // }
    // throw new NotFoundException('댓글 또는 답글을 찾을 수 없습니다.');
  }

  // 댓글 또는 답글 삭제
  async deleteCommentOrReplyById(id: number): Promise<void> {
    await this.commentsDAO.deleteCommentOrReply(id);
  }
}
