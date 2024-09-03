import { Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { SessionUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/interfaces/session-decorator.interface';
import { SignInGuard } from '../auth/guards';

@Controller()
export class LikesController {
  constructor(private readonly likesService: LikesService) {}
  // 게시글 좋아요/ 좋아요 취소 토글
  // @UseGuards(JwtGuard)
  @Post('/posts/:postId/like')
  @HttpCode(200)
  @UseGuards(SignInGuard)
  async scrapPost(@Param('postId') postId: number, @SessionUser() sessionUser: User) {
    const result = await this.likesService.toggleLike(postId, sessionUser);
    return result;
  }
}
