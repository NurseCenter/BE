import { Controller, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { SessionUser } from '../auth/decorators/get-user.decorator';
import { IUserWithoutPassword } from '../auth/interfaces/session-decorator.interface';
import { RegularMemberGuard } from '../auth/guards';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('likes')
@Controller()
export class LikesController {
  constructor(private readonly likesService: LikesService) {}
  // 게시글 좋아요/ 좋아요 취소 토글
  // @UseGuards(JwtGuard)
  @Post('/posts/:postId/like')
  @HttpCode(200)
  @UseGuards(RegularMemberGuard)
  @ApiOperation({ summary: '게시글 좋아요 토글' })
  @ApiParam({ name: 'postId', description: '좋아요를 토글할 게시글의 ID', type: 'number' })
  @ApiResponse({ status: 200, description: '성공적으로 좋아요를 토글했습니다.' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않았습니다.' })
  async scrapPost(@Param('postId') postId: number, @SessionUser() sessionUser: IUserWithoutPassword) {
    const result = await this.likesService.toggleLike(postId, sessionUser);
    return result;
  }
}
