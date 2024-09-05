import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UseGuards } from '@nestjs/common';
import { RepliesService } from './replies.service';
import { ReplyDto } from './dto/reply.dto';
import { BoardType } from '../posts/enum/boardType.enum';
import { IUserWithoutPassword } from '../auth/interfaces/session-decorator.interface';
import { SessionUser } from '../auth/decorators/get-user.decorator';
import { SignInGuard } from '../auth/guards';

@Controller()
export class RepliesController {
  constructor(private readonly repliesService: RepliesService) {}
  // 답글 작성
  // @UseGuards(JwtGuard)
  @Post('comments/:commentId/replies')
  @HttpCode(201)
  @UseGuards(SignInGuard)
  async createReply(
    @Param('commentId') commentId: number,
    @Body() replyDto: ReplyDto,
    @SessionUser() sessionUser: IUserWithoutPassword,
  ) {
    const result = await this.repliesService.createReply(commentId, sessionUser, replyDto);
    return result;
  }
  //특정 게시물 댓글 전체 조회
  @HttpCode(200)
  @Get('comments/:commentId/replies')
  async getReplies(@Param('commentId') commentId: number) {
    const result = await this.repliesService.getReplies(commentId);
    return result;
  }
  //답글 수정
  // @UseGuards(JwtGuard)
  @Patch('replies/:replyId')
  @HttpCode(200)
  @UseGuards(SignInGuard)
  async updateReplies(
    @Param('replyId') replyId: number,
    @Body() replyDto: ReplyDto,
    @SessionUser() sessionUser: IUserWithoutPassword,
  ) {
    const result = await this.repliesService.updateReplies(replyId, sessionUser, replyDto);
    return result;
  }
  //댓글 삭제
  // @UseGuards(JwtGuard)
  @Delete('replies/:replyId')
  @HttpCode(200)
  @UseGuards(SignInGuard)
  async deleteComment(@Param('replyId') replyId: number, @SessionUser() sessionUser: IUserWithoutPassword) {
    const result = await this.repliesService.deleteReplies(replyId, sessionUser);
    return result;
  }
}
