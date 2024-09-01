import { Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { LikesService } from './likes.service';

const userId = 1;

@Controller()
export class LikesController {
  constructor(private readonly likesService: LikesService) {}
  // 게시글 좋아요/ 좋아요 취소 토글
  // @UseGuards(JwtGuard)
  @Post('/posts/:postId/like')
  @HttpCode(200)
  async scrapPost(@Param('postId') postId: number) {
    const result = await this.likesService.toggleLike(postId, userId);
    return result;
  }
}
