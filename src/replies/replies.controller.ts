import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UseGuards } from '@nestjs/common';
import { RepliesService } from './replies.service';
import { ReplyDto } from './dto/reply.dto';
import { IUserWithoutPassword } from '../auth/interfaces/session-decorator.interface';
import { SessionUser } from '../auth/decorators/get-user.decorator';
import { RegularMemberGuard } from '../auth/guards';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Replies')
@Controller()
export class RepliesController {
  constructor(private readonly repliesService: RepliesService) {}

  // 답글 작성
  @UseGuards(RegularMemberGuard)
  @Post('comments/:commentId/replies')
  @HttpCode(201)
  @ApiOperation({ summary: '답글 작성' })
  @ApiParam({ name: 'commentId', type: 'number', description: '댓글 ID' })
  @ApiBody({ type: ReplyDto })
  @ApiResponse({
    status: 201,
    description: '답글 작성 성공',
    schema: {
      example: {
        replyId: 1,
        commentId: 1,
        userId: 1,
        content: 'This is a reply',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
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
    description: '댓글을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '댓글을 찾을 수 없습니다.',
      },
    },
  })
  async createReply(
    @Param('commentId') commentId: number,
    @Body() replyDto: ReplyDto,
    @SessionUser() sessionUser: IUserWithoutPassword,
  ) {
    const result = await this.repliesService.createReply(commentId, sessionUser, replyDto);
    return result;
  }

  // 특정 댓글의 답글 전체 조회
  @UseGuards(RegularMemberGuard)
  @Get('comments/:commentId/replies')
  @HttpCode(200)
  @ApiOperation({ summary: '특정 댓글의 답글 전체 조회' })
  @ApiParam({ name: 'commentId', type: 'number', description: '댓글 ID' })
  @ApiResponse({
    status: 200,
    description: '답글 조회 성공',
    schema: {
      example: [
        {
          replyId: 1,
          commentId: 1,
          userId: 1,
          content: 'This is a reply',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: '댓글을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '댓글을 찾을 수 없습니다.',
      },
    },
  })
  async getReplies(@Param('commentId') commentId: number) {
    const result = await this.repliesService.getReplies(commentId);
    return result;
  }

  // 답글 수정
  @UseGuards(RegularMemberGuard)
  @Patch('replies/:replyId')
  @HttpCode(200)
  @ApiOperation({ summary: '답글 수정' })
  @ApiParam({ name: 'replyId', type: 'number', description: '답글 ID' })
  @ApiBody({ type: ReplyDto })
  @ApiResponse({
    status: 200,
    description: '답글 수정 성공',
    schema: {
      example: {
        replyId: 1,
        commentId: 1,
        userId: 1,
        content: 'Updated reply content',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
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
    description: '권한 없음',
    schema: {
      example: {
        statusCode: 403,
        message: '답글 수정 권한이 없습니다.',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '답글을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '답글을 찾을 수 없습니다.',
      },
    },
  })
  async updateReplies(
    @Param('replyId') replyId: number,
    @Body() replyDto: ReplyDto,
    @SessionUser() sessionUser: IUserWithoutPassword,
  ) {
    const result = await this.repliesService.updateReplies(replyId, sessionUser, replyDto);
    return result;
  }

  // 답글 삭제
  @UseGuards(RegularMemberGuard)
  @Delete('replies/:replyId')
  @HttpCode(200)
  @ApiOperation({ summary: '답글 삭제' })
  @ApiParam({ name: 'replyId', type: 'number', description: '답글 ID' })
  @ApiResponse({
    status: 200,
    description: '답글 삭제 성공',
    schema: {
      example: {
        affected: 1,
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
    description: '권한 없음',
    schema: {
      example: {
        statusCode: 403,
        message: '답글 삭제 권한이 없습니다.',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '답글을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '답글을 찾을 수 없습니다.',
      },
    },
  })
  async deleteComment(@Param('replyId') replyId: number, @SessionUser() sessionUser: IUserWithoutPassword) {
    const result = await this.repliesService.deleteReplies(replyId, sessionUser);
    return result;
  }
}
