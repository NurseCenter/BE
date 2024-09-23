import { Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards';
import { ReportsService } from './reports.service';
import { EReportReason, EReportStatus } from './enum';
import { ReportPostsEntity, ReportCommentsEntity } from './entities';
import { IPaginatedResponse } from 'src/common/interfaces';
import { PaginationQueryDto } from 'src/common/dto';
import { EBoardType } from 'src/posts/enum/board-type.enum';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(AdminGuard)
  @Get('posts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '신고된 게시물 전체 조회' })
  @ApiQuery({ name: 'page', type: 'number', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', type: 'number', required: false, description: '페이지 사이즈' })
  @ApiResponse({
    status: 200,
    description: '신고된 게시물 목록 조회 성공',
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

  // 신고된 특정 게시물 조회
  @UseGuards(AdminGuard)
  @Get('posts/:postId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '신고된 특정 게시물 조회' })
  @ApiParam({ name: 'postId', type: 'string', description: '게시물 ID' })
  @ApiResponse({
    status: 200,
    description: '신고된 게시물 조회 성공',
    schema: {
      type: 'object',
      properties: {
        postAuthor: { type: 'string' },
        postDate: { type: 'string', format: 'date-time' },
        postCategory: { type: 'string', enum: Object.values(EBoardType) },
        postId: { type: 'integer' },
        postTitle: { type: 'string' },
        reporter: { type: 'string' },
        reportDate: { type: 'string', format: 'date-time' },
        reportId: { type: 'integer' },
        reportReason: { type: 'string', enum: Object.values(EReportReason) },
      },
      example: {
        postAuthor: 'Author Name',
        postDate: '2024-09-10T10:00:00.000Z',
        postCategory: EBoardType.EVENT,
        postId: 1001,
        postTitle: 'Sample Post Title',
        reporter: 'Reporter Name',
        reportDate: '2024-09-10T10:00:00.000Z',
        reportId: 1,
        reportReason: EReportReason.PORNOGRAPHY,
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '게시물을 찾을 수 없음' })
  async getReportedPost(@Param('postId') postId: number) {
    return await this.reportsService.getReportedPost(postId);
  }

  // 신고된 게시물 “처리완료”로 전환
  @UseGuards(AdminGuard)
  @Post('posts/:postId/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '신고된 게시물 “처리완료”로 전환' })
  @ApiParam({ name: 'postId', type: 'string', description: '게시물 ID' })
  @ApiResponse({
    status: 200,
    description: '게시물 상태를 “처리완료”로 전환 성공',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
      example: {
        message: '게시물 상태가 “처리완료”로 업데이트 되었습니다.',
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '게시물을 찾을 수 없음' })
  async markPostAsCompleted(@Param('postId') postId: number) {
    await this.reportsService.updatePostStatus(postId, EReportStatus.COMPLETED);
    return { message: '게시물 상태가 “처리완료”로 업데이트 되었습니다.' };
  }

  // 신고된 게시물 “신고반려”로 전환
  @UseGuards(AdminGuard)
  @Post('posts/:postId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '신고된 게시물 “신고반려”로 전환' })
  @ApiParam({ name: 'postId', type: 'string', description: '게시물 ID' })
  @ApiResponse({
    status: 200,
    description: '게시물 상태를 “신고반려”로 전환 성공',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
      example: {
        message: '게시물 상태가 “신고반려”로 업데이트 되었습니다.',
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '게시물을 찾을 수 없음' })
  async rejectPost(@Param('postId') postId: number) {
    await this.reportsService.updatePostStatus(postId, EReportStatus.REJECTED);
    return { message: '게시물 상태가 “신고반려”로 업데이트 되었습니다.' };
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
              reportId: { type: 'integer' },
              commentId: { type: 'integer' },
              postTitle: { type: 'string' },
              commentContent: { type: 'string' },
              commentAuthor: { type: 'string' },
              reportDate: { type: 'string', format: 'date-time' },
              reporter: { type: 'string' },
              reportReason: { type: 'string', enum: Object.values(EReportReason) },
              status: { type: 'string', enum: Object.values(EReportStatus) },
            },
            example: {
              reportId: 1,
              commentId: 2001,
              postTitle: 'Sample Post Title',
              commentContent: 'This is a comment',
              commentAuthor: 'Commenter Name',
              reportDate: '2024-09-10T10:00:00.000Z',
              reporter: 'Reporter Name',
              reportReason: EReportReason.SLANDER_PROFANITY,
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
            reportId: 1,
            commentId: 2001,
            postTitle: 'Sample Post Title',
            commentContent: 'This is a comment',
            commentAuthor: 'Commenter Name',
            reportDate: '2024-09-10T10:00:00.000Z',
            reporter: 'Reporter Name',
            reportReason: EReportReason.SLANDER_PROFANITY,
            status: EReportStatus.PENDING,
          },
        ],
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getAllReportedComments(
    @Query() paginationQueryDto: PaginationQueryDto,
  ): Promise<IPaginatedResponse<ReportCommentsEntity>> {
    const { page = 1, limit = 10 } = paginationQueryDto;
    return await this.reportsService.getAllReportedComments(page, limit);
  }

  // 신고된 특정 댓글 조회
  @UseGuards(AdminGuard)
  @Get('comments/:commentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '신고된 특정 댓글 조회' })
  @ApiParam({ name: 'commentId', type: 'string', description: '댓글 ID' })
  @ApiResponse({
    status: 200,
    description: '신고된 댓글 조회 성공',
    schema: {
      type: 'object',
      properties: {
        commentAuthor: { type: 'string' },
        commentDate: { type: 'string', format: 'date-time' },
        postCategory: { type: 'string', enum: Object.values(EBoardType) },
        postTitle: { type: 'string' },
        commentContent: { type: 'string' },
        reporter: { type: 'string' },
        reportDate: { type: 'string', format: 'date-time' },
        reportId: { type: 'integer' },
        reportReason: { type: 'string', enum: Object.values(EReportReason) },
      },
      example: {
        commentAuthor: 'Commenter Name',
        commentDate: '2024-09-10T10:00:00.000Z',
        postCategory: EBoardType.JOB,
        postTitle: 'Sample Post Title',
        commentContent: 'This is a comment',
        reporter: 'Reporter Name',
        reportDate: '2024-09-10T10:00:00.000Z',
        reportId: 1,
        reportReason: EReportReason.SPAM,
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
  async getReportedComment(@Param('commentId') commentId: number) {
    return await this.reportsService.getReportedComment(commentId);
  }

  // 신고된 댓글 “처리완료”로 전환
  @UseGuards(AdminGuard)
  @Post('comments/:commentId/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '신고된 댓글 “처리완료”로 전환' })
  @ApiParam({ name: 'commentId', type: 'string', description: '댓글 ID' })
  @ApiResponse({
    status: 200,
    description: '댓글 상태를 “처리완료”로 전환 성공',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
      example: {
        message: '댓글 상태가 “처리완료”로 업데이트 되었습니다.',
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
  async markCommentAsCompleted(@Param('commentId') commentId: number) {
    await this.reportsService.updateCommentStatus(commentId, EReportStatus.COMPLETED);
    return { message: '댓글 상태가 “처리완료”로 업데이트 되었습니다.' };
  }

  // 신고된 댓글 “신고반려”로 전환
  @UseGuards(AdminGuard)
  @Post('comments/:commentId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '신고된 댓글 “신고반려”로 전환' })
  @ApiParam({ name: 'commentId', type: 'string', description: '댓글 ID' })
  @ApiResponse({
    status: 200,
    description: '댓글 상태를 “신고반려”로 전환 성공',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
      example: {
        message: '댓글 상태가 “신고반려”로 업데이트 되었습니다.',
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
  async rejectComment(@Param('commentId') commentId: number) {
    await this.reportsService.updateCommentStatus(commentId, EReportStatus.REJECTED);
    return { message: '댓글 상태가 “신고반려”로 업데이트 되었습니다.' };
  }
}
