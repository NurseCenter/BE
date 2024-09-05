import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { BoardType } from '../posts/enum/boardType.enum';
import { CreateCommentDto } from './dto/create-comment.dto';
import { SessionUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/interfaces/session-decorator.interface';
import { ReportPostDto } from '../posts/dto/report-post.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegularMemberGuard } from '../auth/guards';

@ApiTags('comments')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}
  // 댓글 작성
  @Post('posts/:boardType/:postId/comments')
  @HttpCode(201)
  @UseGuards(RegularMemberGuard)
  @ApiOperation({ summary: '댓글 작성' })
  @ApiParam({ name: 'boardType', enum: BoardType, description: '게시판 유형' })
  @ApiParam({ name: 'postId', type: 'number', description: '게시물 ID' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: 201, description: '댓글 생성 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async createComment(
    @Param('boardType') boardType: BoardType,
    @Param('postId') postId: number,
    @Body() createCommentDto: CreateCommentDto,
    @SessionUser() sessionUser: User,
  ) {
    const result = await this.commentsService.createComment(boardType, postId, sessionUser, createCommentDto);
    return result;
  }
  //특정 게시물 댓글 전체 조회
  @Get('posts/:boardType/:postId/comments')
  @HttpCode(200)
  @ApiOperation({ summary: '특정 게시물의 전체 댓글 조회' })
  @ApiParam({ name: 'boardType', enum: BoardType, description: '게시판 유형' })
  @ApiParam({ name: 'postId', type: 'number', description: '게시물 ID' })
  @ApiResponse({ status: 200, description: '댓글 조회 성공' })
  async getComments(@Param('boardType') boardType: BoardType, @Param('postId') postId: number) {
    const result = await this.commentsService.getComments(boardType, postId);
    return result;
  }
  //댓글 수정
  @Patch('comments/:commentId')
  @HttpCode(200)
  @UseGuards(RegularMemberGuard)
  @ApiOperation({ summary: '댓글 수정' })
  @ApiParam({ name: 'commentId', type: 'number', description: '댓글 ID' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: 200, description: '댓글 수정 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
  async updateComment(
    @Param('commentId') commentId: number,
    @Body() updateCommentDto: CreateCommentDto,
    @SessionUser() sessionUser: User,
  ) {
    const result = await this.commentsService.updateComment(commentId, updateCommentDto, sessionUser);
    return result;
  }
  //댓글 삭제
  @Delete('comments/:commentId')
  @HttpCode(200)
  @UseGuards(RegularMemberGuard)
  @ApiOperation({ summary: '댓글 삭제' })
  @ApiParam({ name: 'commentId', type: 'number', description: '댓글 ID' })
  @ApiResponse({ status: 200, description: '댓글 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
  async deleteComment(@Param('commentId') commentId: number, @SessionUser() sessionUser: User) {
    const result = await this.commentsService.deleteComment(commentId, sessionUser);
    return result;
  }

  //특정 댓글 신고
  @Post('comments/:commentId/reports')
  @HttpCode(200)
  @UseGuards(RegularMemberGuard)
  @ApiOperation({ summary: '특정 댓글 신고' })
  @ApiParam({ name: 'commentId', type: 'number', description: '댓글 ID' })
  @ApiBody({ type: ReportPostDto })
  @ApiResponse({ status: 200, description: '댓글 신고 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '자신의 댓글 신고 불가' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '이미 신고한 댓글' })
  async reportComment(
    @Param('commentId') commentId: number,
    @SessionUser() sessionUser: User,
    @Body() reportPostDto: ReportPostDto,
  ) {
    const result = await this.commentsService.reportComment(commentId, sessionUser, reportPostDto);
    return result;
  }
}
