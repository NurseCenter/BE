import { Controller, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { SessionUser } from '../auth/decorators/get-user.decorator';
import { RegularMemberGuard } from '../auth/guards';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ILikeActionResponse } from './interfaces/like-action-response.interface';
import { IUser } from 'src/auth/interfaces';

@ApiTags('Likes')
@Controller()
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  // 게시글 좋아요/ 좋아요 취소 토글
  @UseGuards(RegularMemberGuard)
  @Post('/posts/:postId/like')
  @HttpCode(200)
  @ApiOperation({ summary: '게시글 좋아요 토글' })
  @ApiParam({ name: 'postId', description: '좋아요를 토글할 게시글의 ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: '성공적으로 좋아요를 토글했습니다.',
    schema: {
      example: {
        success: true,
        action: ['liked', 'unliked'],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '게시글을 찾을 수 없습니다.',
    schema: {
      example: {
        statusCode: 404,
        message: '게시글을 찾을 수 없습니다.',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않았습니다.',
    schema: {
      example: {
        statusCode: 401,
        message: '인증이 필요합니다.',
      },
    },
  })
  async scrapPost(@Param('postId') postId: number, @SessionUser() sessionUser: IUser): Promise<ILikeActionResponse> {
    const result = await this.likesService.toggleLike(postId, sessionUser);
    return result;
  }
}
