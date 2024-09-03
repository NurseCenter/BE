import { Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { ScrapService } from './scraps.service';
import { SessionUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/interfaces/session-decorator.interface';
import { SignInGuard } from '../auth/guards';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Scraps')
@Controller('scraps')
export class ScrapController {
  constructor(private readonly scrapsService: ScrapService) {}
  // 게시물 스크랩
  // @UseGuards(JwtGuard)
  @Post('/posts/:postId')
  @HttpCode(201)
  @UseGuards(SignInGuard)
  @ApiOperation({ summary: '게시물 스크랩' })
  @ApiParam({ name: 'postId', type: 'number', description: '스크랩할 게시물 ID' })
  @ApiResponse({ status: 201, description: '스크랩 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '게시물을 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '이미 스크랩한 게시물' })
  async scrapPost(@Param('postId') postId: number, @SessionUser() sessionUser: User) {
    const result = await this.scrapsService.scrapPost(postId, sessionUser);
    return result;
  }
  //내가 스크랩한 게시물 조회
  @Get()
  @HttpCode(200)
  @UseGuards(SignInGuard)
  @ApiOperation({ summary: '내가 스크랩한 게시물 조회' })
  @ApiResponse({ status: 200, description: '스크랩 게시물 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getScrapPosts(@SessionUser() sessionUser: User) {
    const result = await this.scrapsService.getScrapPosts(sessionUser);
    return result;
  }
  //스크랩한 게시물 삭제
  // @UseGuards(JwtGuard)
  @Delete('/:scrapId')
  @HttpCode(200)
  @UseGuards(SignInGuard)
  @ApiOperation({ summary: '스크랩한 게시물 삭제' })
  @ApiParam({ name: 'scrapId', type: 'number', description: '삭제할 스크랩 ID' })
  @ApiResponse({ status: 200, description: '스크랩 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '스크랩을 찾을 수 없음' })
  async deleteScrapPost(@Param('scrapId') scrapId: number, @SessionUser() sessionUser: User) {
    const result = await this.scrapsService.deleteScrapPost(scrapId, sessionUser);
    return result;
  }
}
