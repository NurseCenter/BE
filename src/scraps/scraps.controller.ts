import { Controller, Delete, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { ScrapService } from './scraps.service';
import { SessionUser } from '../auth/decorators/get-user.decorator';
import { RegularMemberGuard } from '../auth/guards';
import { IUserWithoutPassword } from 'src/auth/interfaces';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ScrapsEntity } from './entities/scraps.entity';

@ApiTags('Scraps')
@Controller('scraps')
export class ScrapController {
  constructor(private readonly scrapsService: ScrapService) {}

  // 특정 게시물 스크랩
  @UseGuards(RegularMemberGuard)
  @Post(':postId')
  @HttpCode(201)
  @ApiOperation({ summary: '특정 게시물 스크랩' })
  @ApiParam({ name: 'postId', type: 'number', description: '게시물 ID' })
  @ApiResponse({
    status: 201,
    description: '특정 게시물 스크랩 완료',
    schema: {
      example: {
        scrapId: 1,
        userId: 1,
        postId: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '게시물을 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '이미 스크랩된 게시물' })
  async scrapPost(
    @Param('postId') postId: number,
    @SessionUser() sessionUser: IUserWithoutPassword,
  ): Promise<ScrapsEntity> {
    return await this.scrapsService.scrapPost(postId, sessionUser);
  }

  // 특정 게시물 스크랩 취소
  @UseGuards(RegularMemberGuard)
  @Delete(':postId')
  @HttpCode(200)
  @ApiOperation({ summary: '특정 게시물 스크랩 취소' })
  @ApiParam({ name: 'scrapId', type: 'number', description: '스크랩 ID' })
  @ApiResponse({
    status: 200,
    description: '특정 게시물 스크랩 취소 완료',
    schema: {
      example: {
        message: '스크랩이 취소되었습니다.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: {
        statusCode: 400,
        message: '잘못된 요청입니다.',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    schema: {
      example: {
        statusCode: 401,
        message: '인증이 필요합니다.',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '삭제 권한 없음',
    schema: {
      example: {
        statusCode: 403,
        message: '삭제 권한이 없습니다.',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '스크랩을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '스크랩을 찾을 수 없습니다.',
      },
    },
  })
  async deleteScrapPost(
    @Param('postId') postId: number,
    @SessionUser() sessionUser: IUserWithoutPassword,
  ): Promise<{ message: string }> {
    return await this.scrapsService.deleteScrapedPost(postId, sessionUser);
  }
}
