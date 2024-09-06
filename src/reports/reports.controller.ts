import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards';
import { ReportsService } from './reports.service';
import { EReportStatus } from './enum';
import { PaginatedResponse } from 'src/common/interfaces';
import { ReportPostsEntity, ReportCommentsEntity } from './entities';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // 신고된 게시물 전체 조회
  @UseGuards(AdminGuard)
  @Get('posts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '신고된 게시물 전체 조회' })
  @ApiQuery({ name: 'pageNumber', type: 'number', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'pageSize', type: 'number', required: false, description: '페이지 사이즈' })
  @ApiResponse({ status: 200, description: '신고된 게시물 목록 조회 성공', type: 'PaginatedResponse' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getAllReportedPosts(
    @Query('pageNumber') pageNumber: number = 1,
    @Query('pageSize') pageSize: number = 10
  ): Promise<PaginatedResponse<ReportPostsEntity>> {
    return await this.reportsService.getAllReportedPosts(pageNumber, pageSize);
  }

  // 신고된 특정 게시물 조회
  @UseGuards(AdminGuard)
  @Get('posts/:postId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '신고된 특정 게시물 조회' })
  @ApiParam({ name: 'postId', type: 'string', description: '게시물 ID' })
  @ApiResponse({ status: 200, description: '신고된 게시물 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '게시물을 찾을 수 없음' })
  async getReportedPost(@Param('postId') postId: number) {
    return await this.reportsService.getReportedPost(postId);
  }

  // 신고된 특정 게시물 삭제
  @UseGuards(AdminGuard)
  @Delete('posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '신고된 특정 게시물 삭제' })
  @ApiParam({ name: 'postId', type: 'string', description: '게시물 ID' })
  @ApiResponse({ status: 204, description: '신고된 게시물 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '게시물을 찾을 수 없음' })
  async deleteReportedPost(@Param('postId') postId: number) {
    await this.reportsService.deleteReportedPost(postId);
    return { message: '게시물이 삭제되었습니다.' };
  }

  // 신고된 게시물 “처리완료”로 전환
  @UseGuards(AdminGuard)
  @Post('posts/:postId/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '신고된 게시물 “처리완료”로 전환' })
  @ApiParam({ name: 'postId', type: 'string', description: '게시물 ID' })
  @ApiResponse({ status: 200, description: '게시물 상태를 “처리완료”로 전환 성공' })
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
  @ApiResponse({ status: 200, description: '게시물 상태를 “신고반려”로 전환 성공' })
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
  @ApiQuery({ name: 'pageNumber', type: 'number', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'pageSize', type: 'number', required: false, description: '페이지 사이즈' })
  @ApiResponse({ status: 200, description: '신고된 댓글 목록 조회 성공', type: 'PaginatedResponse' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getAllReportedComments(
    @Query('pageNumber') pageNumber: number = 1,
    @Query('pageSize') pageSize: number = 10
  ): Promise<PaginatedResponse<ReportCommentsEntity>> {
    return await this.reportsService.getAllReportedComments(pageNumber, pageSize);
  }

  // 신고된 특정 댓글 조회
  @UseGuards(AdminGuard)
  @Get('comments/:commentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '신고된 특정 댓글 조회' })
  @ApiParam({ name: 'commentId', type: 'string', description: '댓글 ID' })
  @ApiResponse({ status: 200, description: '신고된 댓글 조회 성공' })
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
  @ApiResponse({ status: 200, description: '댓글 상태를 “처리완료”로 전환 성공' })
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
  @ApiResponse({ status: 200, description: '댓글 상태를 “신고반려”로 전환 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
  async rejectComment(@Param('commentId') commentId: number) {
    await this.reportsService.updateCommentStatus(commentId, EReportStatus.REJECTED);
    return { message: '댓글 상태가 “신고반려”로 업데이트 되었습니다.' };
  }

  // 신고된 특정 댓글 삭제
  @UseGuards(AdminGuard)
  @Delete('comments/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '신고된 특정 댓글 삭제' })
  @ApiParam({ name: 'commentId', type: 'string', description: '댓글 ID' })
  @ApiResponse({ status: 204, description: '신고된 댓글 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
  async deleteReportedComment(@Param('commentId') commentId: number) {
    await this.reportsService.deleteReportedComment(commentId);
    return { message: '댓글이 삭제되었습니다.' };
  }
}
