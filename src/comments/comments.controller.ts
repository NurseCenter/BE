import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { EBoardType } from '../posts/enum/board-type.enum';
import { CreateCommentDto } from './dto/create-comment.dto';
import { SessionUser } from '../auth/decorators/get-user.decorator';
import { IUserWithoutPassword } from '../auth/interfaces/session-decorator.interface';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegularMemberGuard } from '../auth/guards';
import { ReportDto } from 'src/posts/dto/report.dto';
import { PaginationQueryDto } from 'src/common/dto';

@ApiTags('Comments')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // 댓글 작성
  @UseGuards(RegularMemberGuard)
  @Post('posts/:boardType/:postId/comments')
  @HttpCode(201)
  @ApiOperation({ summary: '댓글 작성' })
  @ApiParam({ name: 'boardType', enum: EBoardType, description: '게시판 유형' })
  @ApiParam({ name: 'postId', type: 'number', description: '게시물 ID' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({
    status: 201,
    description: '댓글 생성 성공',
    schema: {
      example: {
        commentId: 1,
        userId: 1,
        postId: 1,
        boardType: 'employment',
        content: 'This is a comment',
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
  async createComment(
    @Param('boardType') boardType: EBoardType,
    @Param('postId') postId: number,
    @Body() createCommentDto: CreateCommentDto,
    @SessionUser() sessionUser: IUserWithoutPassword,
  ) {
    const result = await this.commentsService.createComment(boardType, postId, sessionUser, createCommentDto);
    return result;
  }

  // 특정 게시물의 댓글 전체 조회
  @UseGuards(RegularMemberGuard)
  @Get('posts/:boardType/:postId/comments')
  @HttpCode(200)
  @UseGuards(RegularMemberGuard)
  @ApiOperation({ summary: '특정 게시물에 달린 댓글 전체 조회' })
  @ApiParam({ name: 'boardType', enum: EBoardType, description: '게시판 유형' })
  @ApiParam({ name: 'postId', type: 'number', description: '게시물 ID' })
  @ApiQuery({ name: 'page', type: 'number', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', type: 'number', required: false, description: '페이지 당 항목 수' })
  @ApiResponse({
    status: 200,
    description: '댓글 조회 성공',
    schema: {
      example: {
        items: [
          {
            commentId: 22,
            content: 'practice 37번 게시물에 대한 댓글 4',
            postId: 12,
            boardType: 'practice',
            createdAt: '2024-09-20T13:10:00.584Z',
            updatedAt: '2024-09-20T13:10:00.584Z',
            userId: 39,
            nickname: '새로운관리자',
          },
        ],
        totalItems: 50,
        totalPages: 5,
        currentPage: 1,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: {
        statusCode: 400,
        message: '잘못된 쿼리 파라미터',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '게시물을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '해당 게시물을 찾을 수 없습니다.',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    schema: {
      example: {
        statusCode: 401,
        message: '인증에 실패했습니다.',
        error: 'Unauthorized',
      },
    },
  })
  async getComments(
    @Param('boardType') boardType: EBoardType,
    @Param('postId') postId: number,
    @Query() paginationQueryDto: PaginationQueryDto,
  ) {
    const result = await this.commentsService.getCommentsInOnePost(boardType, postId, paginationQueryDto);
    return result;
  }

  // 댓글 수정
  @UseGuards(RegularMemberGuard)
  @Put('comments/:commentId')
  @HttpCode(200)
  @ApiOperation({ summary: '댓글 수정' })
  @ApiParam({ name: 'commentId', type: 'number', description: '댓글 ID' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({
    status: 200,
    description: '댓글 수정 성공',
    schema: {
      example: {
        commentId: 1,
        userId: 1,
        postId: 1,
        boardType: 'employment',
        content: 'Updated comment content',
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
        message: '댓글 수정 권한이 없습니다.',
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
  async updateComment(
    @Param('commentId') commentId: number,
    @Body() updateCommentDto: CreateCommentDto,
    @SessionUser() sessionUser: IUserWithoutPassword,
  ) {
    return await this.commentsService.updateComment(commentId, updateCommentDto, sessionUser);
  }

  // 댓글 삭제
  @UseGuards(RegularMemberGuard)
  @Delete('comments/:commentId')
  @HttpCode(200)
  @ApiOperation({ summary: '댓글 삭제' })
  @ApiParam({ name: 'commentId', type: 'number', description: '댓글 ID' })
  @ApiResponse({
    status: 200,
    description: '댓글 삭제 성공',
    schema: {
      example: {
        message: '댓글이 삭제되었습니다.',
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
  @ApiResponse({
    status: 403,
    description: '권한 없음',
    schema: {
      example: {
        statusCode: 403,
        message: '댓글 삭제 권한이 없습니다.',
      },
    },
  })
  async deleteComment(@Param('commentId') commentId: number, @SessionUser() sessionUser: IUserWithoutPassword) {
    const result = await this.commentsService.deleteComment(commentId, sessionUser);
    return result;
  }

  // 특정 댓글 신고
  @UseGuards(RegularMemberGuard)
  @Post('comments/:commentId/reports')
  @HttpCode(200)
  @ApiOperation({ summary: '댓글 신고' })
  @ApiParam({ name: 'commentId', type: 'number', description: '댓글 ID' })
  @ApiBody({ type: ReportDto })
  @ApiResponse({
    status: 200,
    description: '댓글 신고 성공',
    schema: {
      example: {
        reportId: 1,
        commentId: 1,
        userId: 1,
        reportedReason: 'SPAM',
        otherReportedReason: null,
        reportedUserId: 2,
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: {
        statusCode: 400,
        message: '신고 사유를 기입해주세요.',
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
    description: '자신의 댓글 신고 불가',
    schema: {
      example: {
        statusCode: 403,
        message: '자신의 댓글을 신고할 수 없습니다.',
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
  @ApiResponse({
    status: 409,
    description: '이미 신고한 댓글',
    schema: {
      example: {
        statusCode: 409,
        message: '이미 신고한 댓글입니다.',
      },
    },
  })
  async reportComment(
    @Param('commentId') commentId: number,
    @SessionUser() sessionUser: IUserWithoutPassword,
    @Body() reportDto: ReportDto,
  ) {
    const result = await this.commentsService.reportComment(commentId, sessionUser, reportDto);
    return result;
  }
}
