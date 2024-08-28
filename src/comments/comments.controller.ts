import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { BoardType } from '../posts/enum/boardType.enum';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}
  // 댓글 작성
  // @UseGuards(JwtGuard)
  @Post('posts/:boardType/:postId/comments')
  async createComment(
    @Param('boardType') boardType: BoardType,
    @Param('postId') postId: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    try {
      const userId = 1;
      const result = await this.commentsService.createComment(
        boardType,
        postId,
        userId,
        createCommentDto,
      );
      return result;
    } catch (err) {
      throw err;
    }
  }
  //특정 게시물 댓글 전체 조회
  @Get('posts/:boardType/:postId/comments')
  async getComments(
    @Param('boardType') boardType: BoardType,
    @Param('postId') postId: number,
  ) {
    try {
      const result = await this.commentsService.getComments(boardType, postId);
      return result;
    } catch (err) {
      throw err;
    }
  }
  //댓글 수정
  // @UseGuards(JwtGuard)
  @Patch('comments/:commentId')
  async updateComment(
    @Param('commentId') commentId: number,
    @Body() updateCommentDto: CreateCommentDto,
  ) {
    try {
      const userId = 1;
      const result = await this.commentsService.updateComment(
        commentId,
        updateCommentDto,
        userId,
      );
      return result;
    } catch (err) {
      throw err;
    }
  }
  //댓글 삭제
  // @UseGuards(JwtGuard)
  @Delete('comments/:commentId')
  async deleteComment(@Param('commentId') commentId: number) {
    try {
      const userId = 1;
      const result = await this.commentsService.deleteComment(
        commentId,
        userId,
      );
      return result;
    } catch (err) {
      throw err;
    }
  }
}
