import { Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { ScrapService } from './scraps.service';
import { SessionUser } from '../auth/decorators/get-user.decorator';
import { IUserWithoutPassword } from '../auth/interfaces/session-decorator.interface';
import { SignInGuard } from '../auth/guards';

@Controller('scraps')
export class ScrapController {
  constructor(private readonly scrapsService: ScrapService) {}
  // 게시물 스크랩
  // @UseGuards(JwtGuard)
  @Post('/posts/:postId')
  @HttpCode(201)
  @UseGuards(SignInGuard)
  async scrapPost(@Param('postId') postId: number, @SessionUser() sessionUser: IUserWithoutPassword) {
    const result = await this.scrapsService.scrapPost(postId, sessionUser);
    return result;
  }
  //내가 스크랩한 게시물 조회
  @Get()
  @HttpCode(200)
  @UseGuards(SignInGuard)
  async getScrapPosts(@SessionUser() sessionUser: IUserWithoutPassword) {
    const result = await this.scrapsService.getScrapPosts(sessionUser);
    return result;
  }
  //스크랩한 게시물 삭제
  // @UseGuards(JwtGuard)
  @Delete('/:scrapId')
  @HttpCode(200)
  @UseGuards(SignInGuard)
  async deleteScrapPost(@Param('scrapId') scrapId: number, @SessionUser() sessionUser: IUserWithoutPassword) {
    const result = await this.scrapsService.deleteScrapPost(scrapId, sessionUser);
    return result;
  }
}
