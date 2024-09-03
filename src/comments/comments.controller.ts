import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { BoardType } from '../posts/enum/boardType.enum';
import { CreateCommentDto } from './dto/create-comment.dto';
import { SessionUser } from '../auth/decorators/get-user.decorator';
import { IUserWithoutPassword } from '../auth/interfaces/session-decorator.interface';
import { SignInGuard } from '../auth/guards';
import { ReportPostDto } from '../posts/dto/report-post.dto';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}
  // 댓글 작성
  // @UseGuards(JwtGuard)
  @Post('posts/:boardType/:postId/comments')
  @HttpCode(201)
  @UseGuards(SignInGuard)
  async createComment(
    @Param('boardType') boardType: BoardType,
    @Param('postId') postId: number,
    @Body() createCommentDto: CreateCommentDto,
    @SessionUser() sessionUser: IUserWithoutPassword,
  ) {
    const result = await this.commentsService.createComment(boardType, postId, sessionUser, createCommentDto);
    return result;
  }
  //특정 게시물 댓글 전체 조회
  @Get('posts/:boardType/:postId/comments')
  @HttpCode(200)
  async getComments(@Param('boardType') boardType: BoardType, @Param('postId') postId: number) {
    const result = await this.commentsService.getComments(boardType, postId);
    return result;
  }
  //댓글 수정
  // @UseGuards(JwtGuard)
  @Patch('comments/:commentId')
  @HttpCode(200)
  @UseGuards(SignInGuard)
  async updateComment(
    @Param('commentId') commentId: number,
    @Body() updateCommentDto: CreateCommentDto,
    @SessionUser() sessionUser: IUserWithoutPassword,
  ) {
    const result = await this.commentsService.updateComment(commentId, updateCommentDto, sessionUser);
    return result;
  }
  //댓글 삭제
  // @UseGuards(JwtGuard)
  @Delete('comments/:commentId')
  @HttpCode(200)
  @UseGuards(SignInGuard)
  async deleteComment(@Param('commentId') commentId: number, @SessionUser() sessionUser: IUserWithoutPassword) {
    const result = await this.commentsService.deleteComment(commentId, sessionUser);
    return result;
  }

  //특정 댓글 신고
  @Post('comments/:commentId/reports')
  @HttpCode(200)
  @UseGuards(SignInGuard)
  async reportComment(
    @Param('commentId') commentId: number,
    @SessionUser() sessionUser: IUserWithoutPassword,
    @Body() reportPostDto: ReportPostDto,
  ) {
    console.log(commentId);
    const result = await this.commentsService.reportComment(commentId, sessionUser, reportPostDto);
    return result;
  }
}
