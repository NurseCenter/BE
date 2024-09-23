import { Controller, Get, Post, Body, Param, Delete, HttpCode, UseGuards, Put } from '@nestjs/common';
import { RepliesService } from './replies.service';
import { IUserWithoutPassword } from '../auth/interfaces/session-decorator.interface';
import { SessionUser } from '../auth/decorators/get-user.decorator';
import { RegularMemberGuard } from '../auth/guards';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateReplyDto } from './dto/create-reply.dto';
import { ReportDto } from 'src/posts/dto';
import { RepliesEntity } from './entities/replies.entity';
import { IReportedReplyResponse } from 'src/reports/interfaces/users';

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
  @ApiBody({ type: CreateReplyDto })
  @ApiResponse({
    status: 201,
    description: '답글 작성 성공',
    schema: {
      example: {
        content:
          '6번 댓글에 대한 답글입니다. 100자 넘어가는지 테스트. 공공필요에 의한 재산권의 수용·사용 또는 제한 및 그에 대한 보상은 법률로써 하되, 정당한 보상을 지급하여야 한다. 선거...',
        userId: 35,
        commentId: 6,
        updatedAt: '2024-09-21T13:53:05.862Z',
        replyId: 2,
        createdAt: '2024-09-21T13:53:05.862Z',
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
    @Body() createReplyDto: CreateReplyDto,
    @SessionUser() sessionUser: IUserWithoutPassword,
  ): Promise<RepliesEntity> {
    const result = await this.repliesService.createReply(commentId, sessionUser, createReplyDto);
    return result;
  }

  // 특정 댓글에 달린 답글 전체 조회
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
        [
          {
            replyId: 1,
            content: '6번 댓글에 대한 첫 번째 답글입니다.',
            userId: 35,
            commentId: 6,
            createdAt: '2024-09-21T13:51:39.351Z',
            updatedAt: '2024-09-21T13:51:39.351Z',
            deletedAt: null,
          },
          {
            replyId: 3,
            content:
              '6번 댓글에 대한 두 번째 답글이다. 헌법재판소는 법률에 저촉되지 아니하는 범위안에서 심판에 관한 절차, 내부규율과 사무처리에 관한 규칙을 제정할 수 있다.',
            userId: 35,
            commentId: 6,
            createdAt: '2024-09-21T13:58:27.870Z',
            updatedAt: '2024-09-21T13:58:27.870Z',
            deletedAt: null,
          },
        ],
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
  async getReplies(@Param('commentId') commentId: number): Promise<RepliesEntity[]> {
    const result = await this.repliesService.getReplies(commentId);
    return result;
  }

  // 답글 수정
  @UseGuards(RegularMemberGuard)
  @Put('replies/:replyId')
  @HttpCode(200)
  @ApiOperation({ summary: '답글 수정' })
  @ApiParam({ name: 'replyId', type: 'number', description: '답글 ID' })
  @ApiBody({ type: CreateReplyDto })
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
    @Body() createReplyDto: CreateReplyDto,
    @SessionUser() sessionUser: IUserWithoutPassword,
  ): Promise<RepliesEntity> {
    const result = await this.repliesService.updateReply(replyId, sessionUser, createReplyDto);
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
  async deleteComment(
    @Param('replyId') replyId: number,
    @SessionUser() sessionUser: IUserWithoutPassword,
  ): Promise<{ message: string }> {
    const result = await this.repliesService.deleteReply(replyId, sessionUser);
    return result;
  }

  // 특정 답글 신고
  @UseGuards(RegularMemberGuard)
  @Post('replies/:replyId/reports')
  @HttpCode(200)
  @ApiOperation({ summary: '답글 신고' })
  @ApiParam({ name: 'replyId', type: 'number', description: '신고할 답글의 ID' })
  @ApiBody({
    description: '답글 신고 정보',
    type: ReportDto,
  })
  @ApiResponse({
    status: 200,
    description: '답글 신고 성공',
    schema: {
      type: 'object',
      properties: {
        reportReplyId: { type: 'number', description: '신고 ID' },
        replyId: { type: 'number', description: '신고된 답글 ID' },
        userId: { type: 'number', description: '신고한 사용자 ID' },
        reportedUserId: { type: 'number', description: '신고된 사용자 ID' },
        reportedReason: { type: 'string', description: '신고 이유' },
        otherReportedReason: { type: 'string', nullable: true, description: '기타 신고 이유' },
        createdAt: { type: 'string', format: 'date-time', description: '신고 일자' },
      },
      example: {
        reportReplyId: 1,
        replyId: 2,
        userId: 35,
        reportedUserId: 30,
        reportedReason: 'spam',
        otherReportedReason: null,
        createdAt: '2024-09-21T13:53:05.862Z',
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
    description: '본인이 작성한 답글은 본인이 신고할 수 없습니다.',
    schema: {
      example: {
        statusCode: 403,
        message: '본인이 작성한 답글은 본인이 신고할 수 없습니다.',
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
  @ApiResponse({
    status: 409,
    description: '이미 신고한 답글',
    schema: {
      example: {
        statusCode: 409,
        message: '이미 신고한 답글입니다.',
      },
    },
  })
  async reportReply(
    @Param('replyId') replyId: number,
    @SessionUser() sessionUser: IUserWithoutPassword,
    @Body() reportDto: ReportDto,
  ): Promise<IReportedReplyResponse> {
    const result = await this.repliesService.reportReply(replyId, sessionUser, reportDto);
    return result;
  }
}
