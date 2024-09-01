import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ScrapService } from './scraps.service';

const userId = 1;

@Controller('scraps')
export class ScrapController {
  constructor(private readonly scrapsService: ScrapService) {}
  // 게시물 스크랩
  // @UseGuards(JwtGuard)
  @Post('/posts/:postId')
  async scrapPost(@Param('postId') postId: number) {
    const result = await this.scrapsService.scrapPost(postId, userId);
    return result;
  }
  //내가 스크랩한 게시물 조회
  @Get()
  async getScrapPosts() {
    const result = await this.scrapsService.getScrapPosts(userId);
    return result;
  }
  //스크랩한 게시물 삭제
  // @UseGuards(JwtGuard)
  @Delete('/:scrapId')
  async deleteScrapPost(@Param('scrapId') scrapId: number) {
    const result = await this.scrapsService.deleteScrapPost(scrapId, userId);
    return result;
  }
}
