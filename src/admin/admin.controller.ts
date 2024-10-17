import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Body,
  Param,
  Query,
  Req,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { AdminGuard } from 'src/auth/guards';
import { AdminService } from './admin.service';
import { IApprovalUserList, IPostList, IUserInfo, IUserList } from './interfaces';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IPaginatedResponse } from 'src/common/interfaces';
import { PaginationQueryDto, SearchQueryDto } from 'src/common/dto';
import { Request, Response } from 'express';
import { ECommentType, EMembershipStatus } from 'src/users/enums';
import { SignInUserDto } from 'src/auth/dto';
import {
  WithdrawalUserDto,
  CancelWithdrawalDto,
  UserIdDto,
  SuspensionUserDto,
  ApprovalUserDto,
  GetOneCommentDto,
} from './dto';
import { RejectUserDto } from './dto/reject-user.dto';
import { EmailQueryDto } from './dto/email-query.dto';
import { EEmailType, ESearchUser } from './enums';
import { SearchUserQueryDto } from './dto/search-user-query.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 관리자 계정 로그인
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '관리자 계정 로그인' })
  @ApiBody({
    type: SignInUserDto,
    description: '로그인에 필요한 정보',
    examples: {
      'application/json': {
        value: {
          email: 'happyday@example.com',
          password: 'Password1!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '로그인에 성공하였습니다.',
    schema: {
      example: {
        message: '로그인이 완료되었습니다.',
        user: {
          userId: 39,
          email: 'iamnewadmin@example.com',
          nickname: '새로운관리자',
          isAdmin: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '관리자 계정이 아닙니다.',
    schema: {
      example: { message: '관리자 계정이 아닙니다.' },
    },
  })
  @ApiResponse({
    status: 404,
    description: '해당 회원이 존재하지 않습니다.',
    schema: {
      example: { message: '해당 회원이 존재하지 않습니다.' },
    },
  })
  @ApiResponse({
    status: 401,
    description: '비밀번호가 일치하지 않습니다.',
    schema: {
      example: { message: '비밀번호가 일치하지 않습니다.' },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: { message: '잘못된 요청입니다.' },
    },
  })
  async postSignIn(
    @Body() signInUserDto: SignInUserDto,
    @Req() req: Request,
    @Res() res: Response,
    autoLogin: boolean,
  ): Promise<void> {
    return await this.adminService.signInByAdmin(signInUserDto, req, res, autoLogin);
  }

  // 관리자 회원 탈퇴 처리
  @UseGuards(AdminGuard)
  @Post('withdrawal')
  @HttpCode(200)
  @ApiOperation({ summary: '관리자의 회원 강제 탈퇴 처리' })
  @ApiBody({
    type: WithdrawalUserDto,
    description: '회원 탈퇴에 필요한 정보',
    examples: {
      'application/json': {
        value: {
          userId: 123,
          deletionReason: '회원이 탈퇴 당하는 사유',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '회원 강제 탈퇴 처리가 완료되었습니다.',
    schema: {
      example: { message: '회원 강제 탈퇴 처리가 완료되었습니다.', userId: 17 },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: { message: '잘못된 요청입니다.' },
    },
  })
  async postWithdrawalByAdmin(
    @Body() withdrawalUserDto: WithdrawalUserDto,
  ): Promise<{ message: string; userId: number }> {
    const { userId, deletionReason } = withdrawalUserDto;
    await this.adminService.withdrawUserByAdmin(userId, deletionReason);
    return { message: '회원 강제 탈퇴 처리가 완료되었습니다.', userId };
  }

  // 관리자 회원 강제 탈퇴 취소(해제)
  @UseGuards(AdminGuard)
  @Post('withdrawal/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '관리자의 회원 강제 탈퇴 취소' })
  @ApiBody({
    type: CancelWithdrawalDto,
    description: '관리자의 회원 강제 탈퇴 취소(해제)에 필요한 사용자 ID',
  })
  @ApiResponse({
    status: 200,
    description: '회원 강제 탈퇴 취소 처리가 완료되었습니다.',
    schema: {
      example: { message: '회원 강제 탈퇴 취소 처리가 완료되었습니다.', userId: 17 },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: { message: '잘못된 요청입니다.' },
    },
  })
  async postCancelWithdrawal(@Body() userIdDto: UserIdDto): Promise<{ message: string; userId: number }> {
    const { userId } = userIdDto;
    await this.adminService.cancelWithdrawal(userId);
    return { message: '회원 강제 탈퇴 취소(해제) 처리가 완료되었습니다.', userId };
  }

  // 관리자 회원 정지 처리
  @UseGuards(AdminGuard)
  @Post('suspension')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '관리자의 회원 정지 처리' })
  @ApiBody({
    type: SuspensionUserDto,
    description: '회원 정지에 필요한 정보',
    examples: {
      'application/json': {
        value: {
          userId: 123,
          suspensionReason: '정지 사유',
          suspensionDuration: '1w',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '회원 정지 처리가 완료되었습니다.',
    schema: {
      example: {
        message: '회원 정지 처리가 완료되었습니다.',
        userId: 60,
        suspensionEndDate: '2024-10-08T11:37:41.823Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: { message: '잘못된 요청입니다.' },
    },
  })
  async postSuspensionByAdmin(
    @Body() suspensionUserDto: SuspensionUserDto,
  ): Promise<{ message: string; userId: number; suspensionEndDate: Date }> {
    const result = await this.adminService.suspendUserByAdmin(suspensionUserDto);
    return { message: '회원 정지 처리가 완료되었습니다.', ...result };
  }

  // 관리자 회원 정지 취소(해제)
  @UseGuards(AdminGuard)
  @Post('suspension/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '관리자의 회원 정지 해제' })
  @ApiBody({
    type: Number,
    description: '관리자의 활동정지 해제 요청에 필요한 회원 ID',
    schema: {
      example: { userId: 123 },
    },
  })
  @ApiResponse({
    status: 200,
    description: '관리자의 회원 활동 정지 해제가 완료되었습니다.',
    schema: {
      example: { message: '관리자의 회원 활동 정지 해제가 완료되었습니다.', userId: 153 },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: { message: '잘못된 요청입니다.' },
    },
  })
  async postCancelSuspension(@Body() userIdDto: UserIdDto): Promise<{ message: string; userId: number }> {
    const { userId } = userIdDto;
    return this.adminService.cancelSuspension(userId);
  }

  // 관리자 전체 회원 조회
  @UseGuards(AdminGuard)
  @Get('users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '전체 회원 조회' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 항목 수' })
  @ApiQuery({ name: 'type', enum: ESearchUser, required: false, description: '검색할 타입 (회원 ID, 닉네임, 이메일)' })
  @ApiQuery({ name: 'search', required: false, description: '검색어' })
  @ApiResponse({
    status: 200,
    description: '회원 목록 조회 성공',
    schema: {
      example: {
        items: [
          {
            userId: 34,
            nickname: '마이콜',
            email: 'mycall@example.com',
            postCount: 1,
            commentCount: 0,
            createdAt: '2024-10-16T05:09:11.818Z',
            managementStatus: '해당없음',
            managementReason: '없음',
          },
          {
            userId: 123,
            nickname: 'user_nickname',
            email: 'user@example.com',
            postCount: 10,
            commentCount: 5,
            createdAt: '2024-01-01T00:00:00.000Z',
            managementStatus: '정지',
            managementReason: '정지된 사유',
          },
          {
            userId: 16,
            nickname: '박지민',
            email: 'user4@example.com',
            postCount: 0,
            commentCount: 0,
            createdAt: '2024-01-05T04:00:00.000Z',
            managementStatus: '탈퇴',
            managementReason: '허락없이 광고글을 여러 번 기재하여 주의 주었지만 무시함.',
          },
        ],
        totalItems: 100,
        totalPages: 10,
        currentPage: 1,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: { message: '잘못된 요청입니다.' },
    },
  })
  async getAllUsers(@Query() query: PaginationQueryDto & SearchUserQueryDto): Promise<IPaginatedResponse<IUserList>> {
    const { page = 1, limit = 10, type, search } = query;
    const result = await this.adminService.fetchAllUsersByAdmin(Number(page), Number(limit), type, search);
    return result;
  }

  // 관리자 특정 회원 정보 조회
  @UseGuards(AdminGuard)
  @Get('users/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '특정 회원 정보 조회' })
  @ApiParam({ name: 'userId', type: Number, description: '회원 ID' })
  @ApiResponse({
    status: 200,
    description: '회원 정보 조회 성공',
    schema: {
      example: {
        userId: 128,
        nickname: '개똥말숙',
        email: 'user@example.com',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: { message: '잘못된 요청입니다.' },
    },
  })
  async getUserInfoByAdmin(@Param('userId') userId: number): Promise<IUserInfo> {
    return await this.adminService.fetchUserInfoByAdmin(userId);
  }

  // 관리자 정회원 승인 대기자 목록 조회
  @UseGuards(AdminGuard)
  @Get('approval')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '정회원 승인 대기자 목록 조회 (membershipStatus = email_verified인 회원)' })
  @ApiQuery({ name: 'page', type: Number, required: true, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 항목 수' })
  @ApiResponse({
    status: 200,
    description: '정회원 승인 대기자 목록 조회 성공',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              userId: { type: 'number', description: '사용자 ID' },
              nickname: { type: 'string', description: '사용자 닉네임' },
              email: { type: 'string', description: '사용자 이메일' },
              createdAt: { type: 'string', format: 'date-time', description: '계정 생성 일자' },
              studentStatus: { type: 'string', description: '학생 상태' },
              membershipStatus: { type: 'string', description: '회원 상태' },
              certificationDocumentUrl: { type: 'string', format: 'uri', description: '인증 문서 URL' },
            },
          },
        },
        totalItems: { type: 'number', description: '총 아이템 수' },
        totalPages: { type: 'number', description: '총 페이지 수' },
        currentPage: { type: 'number', description: '현재 페이지 번호' },
      },
      example: {
        items: [
          {
            userId: 123,
            nickname: 'user_nickname',
            email: 'user@example.com',
            createdAt: '2024-01-01T00:00:00.000Z',
            studentStatus: 'current_student',
            membershipStatus: 'email_verified',
            certificationDocumentUrl: 'http://example.com/document',
          },
        ],
        totalItems: 50,
        totalPages: 5,
        currentPage: 1,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: { message: '잘못된 요청입니다.' },
    },
  })
  async getApprovalsByAdmin(@Query() query: PaginationQueryDto): Promise<IPaginatedResponse<IApprovalUserList>> {
    const { page, limit } = query;
    return await this.adminService.showUserApprovals(page, limit);
  }

  // 관리자의 정회원 승인 및 거절 처리
  @UseGuards(AdminGuard)
  @Post('user/approval')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '회원 가입 승인 처리' })
  @ApiBody({ type: ApprovalUserDto })
  @ApiResponse({
    status: 200,
    description: '회원 가입 승인 처리 성공',
    schema: {
      example: { message: '정회원 승인이 완료되었습니다.', userId: 123, membershipStatus: 'approved_member' },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: { message: '아직 이메일 인증을 완료하지 않은 회원입니다.' },
    },
  })
  async postApprovalByAdmin(
    @Body() approvalDto: ApprovalUserDto,
  ): Promise<{ message: string; userId: number; membershipStatus: EMembershipStatus }> {
    return this.adminService.processUserApproval(approvalDto);
  }

  // 관리자의 정회원 거절 처리
  @UseGuards(AdminGuard)
  @Post('user/rejection')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '회원 가입 거절 처리' })
  @ApiBody({
    description: '회원 가입 거절을 위한 정보',
    type: RejectUserDto,
  })
  @ApiResponse({
    status: 200,
    description: '회원 가입 거절 처리 성공',
    schema: {
      example: {
        message: '정회원 승인이 거절되었습니다.',
        userId: 123,
        rejectedReason: '인증 서류가 졸업증명서나 재학증명서가 아닙니다. 확인 부탁드립니다.',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '해당 회원이 존재하지 않음',
    schema: {
      example: { message: '해당 회원이 존재하지 않습니다.' },
    },
  })
  async postRejectByAdmin(
    @Body() rejectDto: RejectUserDto,
  ): Promise<{ message: string; userId: number; rejectedReason: string }> {
    const { userId, rejectedReason } = rejectDto;
    return this.adminService.processUserReject(userId, rejectedReason);
  }

  // 관리자 게시물 전체 조회 및 검색
  @UseGuards(AdminGuard)
  @Get('posts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '전체 게시물 조회 및 검색' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 항목 수' })
  @ApiQuery({ name: 'search', type: String, required: false, description: '검색어' })
  @ApiResponse({
    status: 200,
    description: '게시물 목록 조회 성공',
    schema: {
      example: {
        items: [
          {
            postId: 123,
            boardType: '공지사항',
            title: '게시물 제목',
            author: '홍길동',
            createdAt: '2024-01-01T00:00:00Z',
            numberOfCommentsAndReplies: 31,
          },
        ],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: { message: '잘못된 요청입니다.' },
    },
  })
  async getAllPosts(@Query() query: SearchQueryDto): Promise<IPaginatedResponse<IPostList>> {
    const { page, limit, search } = query;
    return this.adminService.getAllPosts(page, limit, search);
  }

  // 관리자 특정 게시물 삭제
  @UseGuards(AdminGuard)
  @Delete('posts')
  @HttpCode(200)
  @ApiOperation({ summary: '특정 게시물 삭제' })
  @ApiBody({
    type: [Number], 
    description: '게시물 ID 배열',
  })
  @ApiParam({ name: 'postId', type: Number, description: '게시물 ID' })
  @ApiResponse({
    status: 200,
    description: '게시물 삭제 성공',
    schema: {
      example: { message: '게시물이 성공적으로 삭제되었습니다.', postIds: [1, 2, 3] },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: { message: '잘못된 요청입니다.' },
    },
  })
  async deletePosts(@Body('postIds') postIds: number[]): Promise<{ message: string; postIds: number[] }> {
    console.log("postIds", postIds)
    await this.adminService.deletePosts(postIds);
    return { message: '게시물이 성공적으로 삭제되었습니다.', postIds };
  }

  // 관리자 댓글 및 답글 전체 조회
  @UseGuards(AdminGuard)
  @Get('comments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '전체 댓글 및 답글 조회' })
  @ApiQuery({ name: 'page', type: Number, required: true, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 항목 수' })
  @ApiResponse({
    status: 200,
    description: '댓글 목록 조회 성공',
    schema: {
      example: {
        items: [
          {
            id: 29,
            type: 'reply',
            postId: 8,
            category: 'notice',
            postTitle: '간호학과 실습 병원 변경 안내',
            content: '유저41번이 남긴 답글이다',
            createdAt: '2024-09-23T05:23:22.541Z',
          },
          {
            id: 67,
            type: 'comment',
            postId: 1,
            category: 'job',
            postTitle: '제목 수정할게요. 되는지 보자',
            content: '유저41번이 남긴 댓글',
            createdAt: '2024-09-23T05:21:23.690Z',
          },
        ],
        totalItems: 119,
        totalPages: 12,
        currentPage: 4,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: { message: '잘못된 요청입니다.' },
    },
  })
  async getAllComments(@Query() query: PaginationQueryDto): Promise<IPaginatedResponse<any>> {
    const { page, limit } = query;
    return await this.adminService.findAllCommentsAndReplies(page, limit);
  }

  // 관리자 특정 댓글 혹은 답글 삭제
  // 댓글 혹은 답글의 종류, ID 값을 넘겨주면 삭제함.
  @UseGuards(AdminGuard)
  @Delete('comments')
  @HttpCode(200)
  @ApiOperation({ summary: '특정 댓글 또는 답글 삭제' })
  @ApiQuery({ name: 'type', type: String, description: '댓글 또는 답글 타입', enum: ECommentType })
  @ApiQuery({ name: 'commentId', type: Number, description: '댓글 또는 답글 ID' })
  @ApiResponse({
    status: 200,
    description: '댓글 또는 답글 삭제 성공',
    schema: {
      example: { message: '댓글이 성공적으로 삭제되었습니다.', type: 'reply', commentId: 128 },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: { message: '잘못된 요청입니다.' },
    },
  })
  async deleteComment(
    @Query() getOneCommentDto: GetOneCommentDto,
  ): Promise<{ message: string; type: ECommentType; commentId: number }> {
    const { type, commentId } = getOneCommentDto;
    await this.adminService.deleteCommentOrReplyById(type, commentId);
    return { message: '댓글이 성공적으로 삭제되었습니다.', type, commentId };
  }

  // 관리자 이메일 발송
  @UseGuards(AdminGuard)
  @Post('email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일 발송' })
  @ApiBody({
    description: '이메일 발송을 위한 정보',
    type: EmailQueryDto,
  })
  @ApiResponse({
    status: 200,
    description: '이메일 발송 성공',
  })
  @ApiResponse({
    status: 404,
    description: '해당 회원이 존재하지 않음',
  })
  async handleEmailSending(
    @Query('type') emailType: EEmailType,
    @Body() { userId }: { userId: number },
  ): Promise<{ message: string; email: string }> {
    switch (emailType) {
      case 'rejection':
        return this.adminService.sendMembershipRejectionEmail(userId);
      case 'withdrawal':
        return this.adminService.sendForcedWithdrawalEmail(userId);
      case 'suspension':
        return this.adminService.sendAccountSuspensionEmail(userId);
      case 'approval':
        return this.adminService.sendApprovalEmail(userId);
      default:
        throw new NotFoundException('지원하지 않는 이메일 유형입니다.');
    }
  }

  @Post('check-password')
  @ApiOperation({ summary: '관리자 페이지 비밀번호 확인' })
  @ApiBody({
    description: '비밀번호 확인을 위한 요청 본문',
    type: String,
    schema: {
      type: 'object',
      properties: {
        password: {
          type: 'string',
          example: 'yourPassword',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '비밀번호가 일치하는 경우 성공 메시지 반환',
    schema: {
      example: {
        message: '입력한 비밀번호가 관리자 페이지 비밀번호와 일치합니다.',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '비밀번호가 일치하지 않는 경우 오류 반환',
    schema: {
      example: {
        statusCode: 403,
        message: '입력한 비밀번호가 관리자 페이지 비밀번호와 일치하지 않습니다.',
      },
    },
  })
  async postCheckPassword(@Body('password') plainPassword: string) {
    await this.adminService.checkAdminPagePassword(plainPassword);
    return { message: '입력한 비밀번호가 관리자 페이지 비밀번호와 일치합니다.' };
  }
}
