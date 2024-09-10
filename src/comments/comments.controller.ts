import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { EBoardType } from '../posts/enum/board-type.enum';
import { CreateCommentDto } from './dto/create-comment.dto';
import { SessionUser } from '../auth/decorators/get-user.decorator';
import { IUserWithoutPassword } from '../auth/interfaces/session-decorator.interface';
import { ReportPostDto } from '../posts/dto/report-post.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegularMemberGuard } from '../auth/guards';

@ApiTags('Comments')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // 댓글 작성
  @UseGuards(RegularMemberGuard)
  @Post('posts/:boardType/:postId')
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

  // 특정 게시물 댓글 전체 조회
  @UseGuards(RegularMemberGuard)
  @Get('posts/:boardType/:postId')
  @HttpCode(200)
  @ApiOperation({ summary: '특정 게시물 댓글 전체 조회' })
  @ApiParam({ name: 'boardType', enum: EBoardType, description: '게시판 유형' })
  @ApiParam({ name: 'postId', type: 'number', description: '게시물 ID' })
  @ApiResponse({
    status: 200,
    description: '댓글 목록 조회 성공',
    schema: {
      example: [
        {
          commentId: 1,
          userId: 1,
          postId: 1,
          boardType: 'employment',
          content: 'This is a comment',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: '게시물 또는 댓글을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '게시물이나 댓글을 찾을 수 없습니다.',
      },
    },
  })
  async getComments(@Param('boardType') boardType: EBoardType, @Param('postId') postId: number) {
    const result = await this.commentsService.getComments(boardType, postId);
    return result;
  }

  //댓글 수정
  @UseGuards(RegularMemberGuard)
  @Patch(':commentId')
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
    const result = await this.commentsService.updateComment(commentId, updateCommentDto, sessionUser);
    return result;
  }

  // 댓글 삭제
  @UseGuards(RegularMemberGuard)
  @Delete(':commentId')
  @HttpCode(204)
  @ApiOperation({ summary: '댓글 삭제' })
  @ApiParam({ name: 'commentId', type: 'number', description: '댓글 ID' })
  @ApiResponse({
    status: 200,
    description: '댓글 삭제 성공',
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
  @Post(':commentId/reports')
  @HttpCode(200)
  @ApiOperation({ summary: '특정 댓글 신고' })
  @ApiParam({ name: 'commentId', type: 'number', description: '댓글 ID' })
  @ApiBody({ type: ReportPostDto })
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
    @Body() reportPostDto: ReportPostDto,
  ) {
    const result = await this.commentsService.reportComment(commentId, sessionUser, reportPostDto);
    return result;
  }
}
