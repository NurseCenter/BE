import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { BoardType } from '../posts/enum/boardType.enum';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}
  //댓글 작성
  // @Post('posts/:boardType/:postId/comments')
  // async createComment(
  //   @Param('boardType') boardType: BoardType,
  //   @Param('postId') postId: number,
  //   @Body() createCommentDto: CreateCommentDto,
  // ) {
  //   const result = await this.commentsService.createComment(
  //     boardType,
  //     postId,
  //     createCommentDto,
  //   );
  //   return result;
  // }
  // //특정 게시물 댓글 전체 조회
  // @Get('posts/:boardType/:postId/comments')
  // async getComments(
  //   @Param('boardType') boardType: BoardType,
  //   @Param('postId') postId: number,
  // ) {
  //   const result = await this.commentsService.getComments(boardType, postId);
  // }
  // //댓글 수정
  // @Patch('comments/:commentId')
  // async updateComment(
  //   @Param('commentId') commentId: number,
  //   @Body() updateCommentDto: CreateCommentDto,
  // ) {
  //   const result = await this.commentsService.updateComment(
  //     commentId,
  //     updateCommentDto,
  //   );
  // }
  // //댓글 삭제
  // @Delete('comments/:commentId')
  // async deleteComment(@Param('commentId') commentId: number) {
  //   const userId = 1;
  //   const result = await this.commentsService.deleteComment(commentId, userId);
  // }
}
