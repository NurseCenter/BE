import { Controller, Delete, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { ScrapService } from './scraps.service';
import { SessionUser } from '../auth/decorators/get-user.decorator';
import { RegularMemberGuard } from '../auth/guards';
import { IUserWithoutPassword } from 'src/auth/interfaces';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Scraps')
@Controller('scraps')
export class ScrapController {
  constructor(private readonly scrapsService: ScrapService) {}

  // 게시물 스크랩
  @UseGuards(RegularMemberGuard)
  @Post('/:postId')
  @HttpCode(201)
  @ApiOperation({ summary: '게시물 스크랩' })
  @ApiParam({ name: 'postId', type: 'number', description: '게시물 ID' })
  @ApiResponse({
    status: 201,
    description: '게시물이 스크랩되었습니다.',
    schema: {
      example: {
        scrapId: 1,
        userId: 1,
        postId: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        deletedAt: null,
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
    status: 404,
    description: '게시물을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '게시물을 찾을 수 없습니다.',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: '이미 스크랩된 게시물',
    schema: {
      example: {
        statusCode: 409,
        message: '이미 해당 게시물이 스크랩되었습니다.',
      },
    },
  })
  async scrapPost(@Param('postId') postId: number, @SessionUser() sessionUser: IUserWithoutPassword) {
    const result = await this.scrapsService.scrapPost(postId, sessionUser);
    return result;
  }

  // 스크랩한 게시물 삭제
  @UseGuards(RegularMemberGuard)
  @Delete('/:scrapId')
  @HttpCode(200)
  @ApiOperation({ summary: '스크랩한 게시물 삭제' })
  @ApiParam({ name: 'scrapId', type: 'number', description: '스크랩 ID' })
  @ApiResponse({
    status: 200,
    description: '스크랩한 게시물이 삭제되었습니다.',
    schema: {
      example: {
        affected: 1,
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
  async deleteScrapPost(@Param('scrapId') scrapId: number, @SessionUser() sessionUser: IUserWithoutPassword) {
    const result = await this.scrapsService.deleteScrapPost(scrapId, sessionUser);
    return result;
  }
}
