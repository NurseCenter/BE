import { Controller, Get, Body, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards';
import { ReportsService } from './reports.service';
import { EReportReason, EReportStatus } from './enum';
import { ReportPostsEntity } from './entities';
import { IPaginatedResponse } from 'src/common/interfaces';
import { PaginationQueryDto } from 'src/common/dto';
import { EBoardType } from 'src/posts/enum/board-type.enum';
import { UpdateReportStatusDto } from './dto/update-report-post-status.dto';
import { GetOneReportedPostDetailDto } from './dto/get-one-reported-post-detail.dto';
import { GetOneReportedCommentDetailDto, UpdateReportCommentStatusDto } from './dto';
import { ECommentType } from 'src/users/enums';
import { ICombinedReportResultResponse, IFormattedReportedPostResponse } from './interfaces/admin';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // 신고된 게시물 내역 전체 조회
  @UseGuards(AdminGuard)
  @Get('posts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '신고된 게시물 내역 전체 조회' })
  @ApiQuery({ name: 'page', type: 'number', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', type: 'number', required: false, description: '페이지 사이즈' })
  @ApiResponse({
    status: 200,
    description: '신고된 게시물 내역 목록 조회 성공',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              reportPostId: { type: 'integer' },
              postId: { type: 'integer' },
              postTitle: { type: 'string' },
              postAuthor: { type: 'string' },
              reportDate: { type: 'string', format: 'date-time' },
              reporter: { type: 'string' },
              reportReason: { type: 'string', enum: Object.values(EReportReason) },
              status: { type: 'string', enum: Object.values(EReportStatus) },
            },
            example: {
              reportId: 1,
              postId: 1001,
              postTitle: 'Sample Post Title',
              postAuthor: 'Author Name',
              reportDate: '2024-09-10T10:00:00.000Z',
              reporter: 'Reporter Name',
              reportReason: EReportReason.PORNOGRAPHY,
              status: EReportStatus.PENDING,
            },
          },
        },
        totalItems: { type: 'integer' },
        totalPages: { type: 'integer' },
        currentPage: { type: 'integer' },
      },
      example: {
        items: [
          {
            reportId: 36,
            postId: 15,
            postCategory: 'job',
            postTitle: '신규 간호사 채용 공고',
            postAuthor: '닉넴뭐하지',
            reportDate: '2024-09-20T03:39:09.131Z',
            reporter: 39,
            reportReason: 'spam',
            status: 'pending',
          },
        ],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getAllReportedPosts(
    @Query() paginationQueryDto: PaginationQueryDto,
  ): Promise<IPaginatedResponse<ReportPostsEntity>> {
    const { page = 1, limit = 10 } = paginationQueryDto;
    return await this.reportsService.getAllReportedPosts(page, limit);
  }

  // 신고된 특정 게시물 내역 조회
  @UseGuards(AdminGuard)
  @Get('post')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '신고된 특정 게시물 내역 조회' })
  @ApiQuery({ name: 'reportId', type: 'number', description: '신고 테이블 고유 ID', required: true })
  @ApiQuery({ name: 'postId', type: 'number', description: '게시물 ID', required: true })
  @ApiResponse({
    status: 200,
    description: '신고된 특정 게시물 내역 조회 성공',
    schema: {
      type: 'object',
      properties: {
        postAuthor: { type: 'string', description: '게시물 작성자' },
        postDate: { type: 'string', format: 'date-time', description: '게시물 작성일자' },
        postCategory: { type: 'string', enum: Object.values(EBoardType), description: '게시물 카테고리' },
        postId: { type: 'integer', description: '게시물 ID' },
        postTitle: { type: 'string', description: '게시물 제목' },
        reporter: { type: 'string', description: '신고자 닉네임' },
        reportDate: { type: 'string', format: 'date-time', description: '신고일자' },
        reportId: { type: 'integer', description: '신고 테이블에서의 고유 ID' },
        reportedReason: { type: 'string', enum: Object.values(EReportReason), description: '신고 사유' },
        otherReportedReason: { type: 'string', description: '기타 신고 사유 (선택적)' },
      },
      example: {
        postAuthor: 'Author Name',
        postDate: '2024-09-10T10:00:00.000Z',
        postCategory: EBoardType.EVENT,
        postId: 1001,
        postTitle: '신고해봐라 이것들아',
        reporter: '정의의용사',
        reportDate: '2024-09-10T10:00:00.000Z',
        reportId: 1,
        reportedReason: EReportReason.PORNOGRAPHY,
        otherReportedReason: null,
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '게시물을 찾을 수 없음' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async getReportedPost(
    @Query() getOneReportedDetailDto: GetOneReportedPostDetailDto,
  ): Promise<IFormattedReportedPostResponse> {
    const { reportId, postId } = getOneReportedDetailDto;
    return await this.reportsService.getReportedPost(reportId, postId);
  }

  // 신고된 게시물 내역 처리상태를 변경
  @UseGuards(AdminGuard)
  @Post('posts/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '신고된 게시물 내역 처리상태를 변경' })
  @ApiBody({
    description: '신고된 게시물 상태 업데이트 정보',
    type: UpdateReportStatusDto,
  })
  @ApiResponse({
    status: 200,
    description: '신고된 게시물 내역 처리상태를 변경',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        reportId: { type: 'number' },
        postId: { type: 'number' },
        status: { type: 'string', enum: Object.values(EReportStatus) }
      },
      example: {
        "message": "updated",
        "reportId": 35,
        "postId": 44,
        "status": "rejected"
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '게시물을 찾을 수 없음' })
  async updateReportedPostStatus(@Body() updateReportStatusDto: UpdateReportStatusDto) {
    const { reportId, postId, status } = updateReportStatusDto;
    return await this.reportsService.updatePostStatus(reportId, postId, status);
  }

  // 신고된 댓글 전체 조회
  @UseGuards(AdminGuard)
  @Get('comments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '신고된 댓글 전체 조회' })
  @ApiQuery({ name: 'page', type: 'number', required: true, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', type: 'number', required: false, description: '페이지 사이즈' })
  @ApiResponse({
    status: 200,
    description: '신고된 댓글 목록 조회 성공',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['comment', 'reply'] },
              reportId: { type: 'integer' },
              commentId: { type: 'integer' },
              commentContent: { type: 'string' },
              commentAuthor: { type: 'string' },
              reportDate: { type: 'string', format: 'date-time' },
              reporter: { type: 'string' },
              reportReason: { type: 'string', enum: Object.values(EReportReason) },
              otherReportedReason: { type: 'string', nullable: true },
              status: { type: 'string', enum: Object.values(EReportStatus) },
            },
            example: {
              type: 'comment',
              reportId: 34,
              commentId: 43,
              commentContent: '유저41번이 남긴 댓글',
              commentAuthor: '23일두번째',
              reportDate: '2024-09-23T06:13:46.643Z',
              reporter: '23일테스트',
              reportReason: 'spam',
              otherReportedReason: null,
              status: 'pending',
            },
          },
        },
        totalItems: { type: 'integer' },
        totalPages: { type: 'integer' },
        currentPage: { type: 'integer' },
      },
      example: {
        items: [
          {
            type: 'comment',
            reportId: 34,
            commentId: 43,
            commentContent: '유저41번이 남긴 댓글',
            commentAuthor: '23일두번째',
            reportDate: '2024-09-23T06:13:46.643Z',
            reporter: '23일테스트',
            reportReason: 'spam',
            otherReportedReason: null,
            status: 'pending',
          },
          {
            type: 'comment',
            reportId: 30,
            commentId: 26,
            commentContent: '내가 쓴 댓글 및 답글 테스트2',
            commentAuthor: '닉넴뭐하지',
            reportDate: '2024-09-23T06:13:35.020Z',
            reporter: '23일테스트',
            reportReason: 'spam',
            otherReportedReason: null,
            status: 'pending',
          },
        ],
        totalItems: 60,
        totalPages: 12,
        currentPage: 3,
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getAllReportedCommentsAndReplies(
    @Query() paginationQueryDto: PaginationQueryDto,
  ): Promise<IPaginatedResponse<ICombinedReportResultResponse>> {
    const { page = 1, limit = 10 } = paginationQueryDto;
    return await this.reportsService.getAllReportedCommentsAndReplies(page, limit);
  }

  // 신고된 특정 댓글 혹은 답글 내역 조회
  @UseGuards(AdminGuard)
  @Get('comment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '신고된 특정 댓글 혹은 답글 내역 조회' })
  @ApiQuery({ name: 'reportId', type: 'number', description: '신고 테이블 고유 ID', required: true })
  @ApiQuery({ name: 'commentId', type: 'number', description: '댓글 ID', required: true })
  @ApiQuery({ name: 'type', enum: ECommentType, description: '댓글 또는 답글 타입', required: true })
  @ApiResponse({
    status: 200,
    description: '신고된 댓글 조회 성공',
    schema: {
      type: 'object',
      properties: {
        commentAuthor: { type: 'string' },
        commentDate: { type: 'string', format: 'date-time' },
        postCategory: { type: 'string', enum: Object.values(EBoardType) },
        postId: { type: 'integer' },
        postTitle: { type: 'string' },
        commentContent: { type: 'string' },
        reporter: { type: 'string' },
        reportDate: { type: 'string', format: 'date-time' },
        reportedReason: { type: 'string', enum: Object.values(EReportReason) },
        otherReportedReason: { type: 'string', nullable: true },
      },
      example: {
        commentAuthor: '독기냥냥이',
        commentDate: '2024-09-10T10:00:00.000Z',
        postCategory: EBoardType.JOB,
        postId: 1001,
        postTitle: '클릭하면 월급 천 만원',
        commentContent: '어그로 끌지말자^^',
        reporter: '우리지구푸르게',
        reportDate: '2024-09-10T10:00:00.000Z',
        reportedReason: EReportReason.SPAM,
        otherReportedReason: null,
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
  async getReportedComment(@Query() getOneReportedCommentDetailDto: GetOneReportedCommentDetailDto) {
    const { reportId, type, commentId } = getOneReportedCommentDetailDto;
    return await this.reportsService.getReportedComment(reportId, type, commentId);
  }

  // 신고된 댓글 내역 처리상태를 변경
  @UseGuards(AdminGuard)
  @Post('comments/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '신고된 댓글 내역 처리상태를 변경' })
  @ApiBody({
    description: '신고된 댓글(혹은 답글) 내역의 상태 변경 요청 본문',
    type: UpdateReportCommentStatusDto, 
  })
  @ApiResponse({
    status: 200,
    description: '신고된 댓글 내역 처리상태 변경 성공',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        reportId: { type: 'number' },
        commentId: { type: 'number' },
        status: { type: 'string', enum: Object.values(EReportStatus) }
      },
      examples: {
        example1: {
          summary: '댓글 처리상태가 처리완료로 변경된 경우',
          value: {
            message: "updated",
            reportId: 35,
            commentId: 44,
            status: "completed",
          },
        },
        example2: {
          summary: "답글 처리상태가 처리중(기본값)으로 변경된 경우",
          value: {
            message: "updated",
            reportId: 36,
            replyId: 45,
            status: "pending",
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
  async updateReportedCommentStatus(@Body() updateReportedCommentStatusDto: UpdateReportCommentStatusDto) {
    const { reportId, type, status } = updateReportedCommentStatusDto;
    return await this.reportsService.updateCommentStatus(reportId, type, status);
  }
}
