import { Controller, Get, Body, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards';
import { ReportsService } from './reports.service';
import { EReportReason, EReportStatus } from './enum';
import { ReportPostsEntity } from './entities';
import { IPaginatedResponse } from 'src/common/interfaces';
import { PaginationQueryDto } from 'src/common/dto';
import { UpdateReportStatusDto } from './dto/update-report-post-status.dto';
import { UpdateReportCommentStatusDto } from './dto';
import { ICombinedReportResultResponse } from './interfaces/admin';

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
              postAuthor: '작성자',
              reportDate: '2024-09-10T10:00:00.000Z',
              reporter: '신고자',
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
            reporter: '신고Go',
            reportReason: 'spam',
            status: 'pending',
            numberOfCommentsAndReplies: 25,
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
        status: { type: 'string', enum: Object.values(EReportStatus) },
      },
      example: {
        message: 'updated',
        reportId: 35,
        postId: 44,
        status: 'rejected',
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '게시물을 찾을 수 없음' })
  async updateReportedPostStatus(@Body() updateReportStatusDto: UpdateReportStatusDto) {
    const { reportId, postId, status } = updateReportStatusDto;
    return await this.reportsService.updatePostStatus(reportId, postId, status);
  }

  // 신고된 댓글 및 답글 전체 조회
  @UseGuards(AdminGuard)
  @Get('comments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '신고된 댓글 및 답글 전체 조회' })
  @ApiQuery({ name: 'page', type: 'number', required: true, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', type: 'number', required: false, description: '페이지 사이즈' })
  @ApiResponse({
    status: 200,
    description: '신고된 댓글 및 답글 목록 조회 성공',
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
              postId: { type: 'integer' },
              postCategory: {
                type: 'string',
                enum: ['employment', 'event', 'exam', 'job', 'notice', 'practice', 'theory', 'all'],
              },
              postTitle: { type: 'string' },
            },
            example: {
              type: 'comment',
              reportId: 34,
              commentId: 43,
              commentContent: '클릭하면 월급 천 만원',
              commentAuthor: '독기냥냥이',
              reportDate: '2024-09-23T06:13:46.643Z',
              reporter: '지구푸르게',
              reportReason: 'spam',
              otherReportedReason: null,
              status: 'pending',
              postId: 21,
              postCategory: 'job',
              postTitle: '신규 간호사 채용 공고',
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
            postId: 25,
            postCategory: 'exam',
            postTitle: '간호관리학 시험 잘보는 방법',
          },
          {
            type: 'reply',
            reportId: 30,
            commentId: 26,
            commentContent: '내가 쓴 댓글 및 답글 테스트2',
            commentAuthor: '닉넴뭐하지',
            reportDate: '2024-09-23T06:13:35.020Z',
            reporter: '23일테스트',
            reportReason: 'spam',
            otherReportedReason: null,
            status: 'pending',
            postId: 21,
            postCategory: 'job',
            postTitle: '신규 간호사 채용 공고',
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
        status: { type: 'string', enum: Object.values(EReportStatus) },
      },
      examples: {
        example1: {
          summary: '댓글 처리상태가 처리완료로 변경된 경우',
          value: {
            message: 'updated',
            reportId: 35,
            commentId: 44,
            status: 'completed',
          },
        },
        example2: {
          summary: '답글 처리상태가 처리중(기본값)으로 변경된 경우',
          value: {
            message: 'updated',
            reportId: 36,
            replyId: 45,
            status: 'pending',
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
