import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { RepliesService } from './replies.service';
import { ReplyDto } from './dto/reply.dto';
import { BoardType } from '../posts/enum/boardType.enum';

@Controller()
export class RepliesController {
  constructor(private readonly repliesService: RepliesService) {}
  // 답글 작성
  // @UseGuards(JwtGuard)
  @Post('comments/:commentId/replies')
  @HttpCode(201)
  async createReply(@Param('commentId') commentId: number, @Body() replyDto: ReplyDto) {
    const userId = 1;
    const result = await this.repliesService.createReply(commentId, userId, replyDto);
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
  async updateReplies(@Param('replyId') replyId: number, @Body() replyDto: ReplyDto) {
    const userId = 1;
    const result = await this.repliesService.updateReplies(replyId, userId, replyDto);
    return result;
  }
  //댓글 삭제
  // @UseGuards(JwtGuard)
  @Delete('replies/:replyId')
  @HttpCode(200)
  async deleteComment(@Param('replyId') replyId: number) {
    const userId = 1;
    const result = await this.repliesService.deleteReplies(replyId, userId);
    return result;
  }
}
