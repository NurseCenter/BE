import { Controller, Get, Patch, Body, Query, UseGuards, HttpCode, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { SessionUser } from 'src/auth/decorators/get-user.decorator';
import { GetMyCommentsQueryDto, GetMyPostsQueryDto, UpdateNicknameDto, UpdatePasswordDto } from './dto';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegularMemberGuard, SignInGuard } from 'src/auth/guards';
import { Request } from 'express';
import { IPaginatedResponse } from 'src/common/interfaces';
import { GetMyScrapsQueryDto } from './dto/get-my-scraps-query-dto';
import { IUser } from 'src/auth/interfaces';

@ApiTags('Me')
@Controller('me')
export class MeController {
  constructor(private readonly usersService: UsersService) {}

  // 본인 정보 조회
  @UseGuards(SignInGuard)
  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: '본인 정보 조회' })
  @ApiResponse({
    status: 200,
    description: '본인의 정보가 성공적으로 조회되었습니다.',
    schema: {
      example: {
        nickname: 'exampleNickname',
        email: 'example@example.com',
        username: 'exampleUser',
        phoneNumber: '010-1234-5678',
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
  async getMyInfo(@SessionUser() user: IUser) {
    return this.usersService.fetchMyInfo(user);
  }

  // 본인 닉네임 수정
  @UseGuards(SignInGuard)
  @Patch('nickname')
  @HttpCode(200)
  @ApiOperation({ summary: '본인 닉네임 수정' })
  @ApiBody({
    type: UpdateNicknameDto,
    description: '수정할 닉네임 정보',
    examples: {
      'application/json': {
        value: { newNickname: '맥모닝불여일견' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '닉네임이 성공적으로 수정되었습니다.',
    schema: {
      example: { message: '닉네임이 수정되었습니다.', newNickname: '맥모닝굿모닝' },
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
    status: 409,
    description: '인증 실패',
    schema: {
      example: {
        statusCode: 409,
        message: '이미 사용 중인 닉네임입니다.',
      },
    },
  })
  async patchMyInfo(@SessionUser() user: IUser, @Body() updateNicknameDto: UpdateNicknameDto, @Req() req: Request) {
    return this.usersService.updateMyNickname(user, updateNicknameDto, req);
  }

  // 본인 비밀번호 수정
  @UseGuards(SignInGuard)
  @Patch('password')
  @HttpCode(200)
  @ApiOperation({ summary: '본인 비밀번호 수정' })
  @ApiBody({
    type: UpdatePasswordDto,
    description: '수정할 비밀번호 정보',
    examples: {
      'application/json': {
        value: {
          oldPassword: 'OldPassword1!',
          newPassword: 'NewPassword1!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '비밀번호가 성공적으로 수정되었습니다.',
    schema: {
      example: { message: '비밀번호가 수정되었습니다.' },
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
        message: '수정 권한이 없습니다.',
      },
    },
  })
  async patchMyPassword(@SessionUser() user: IUser, @Body() updatePasswordDto: UpdatePasswordDto) {
    const { userId } = user;
    return this.usersService.updateMyPassword(userId, updatePasswordDto);
  }

  // 본인 게시글 전체 조회
  @UseGuards(RegularMemberGuard)
  @Get('posts')
  @HttpCode(200)
  @ApiOperation({ summary: '본인 게시글 전체 조회' })
  @ApiQuery({ name: 'page', type: Number, description: '페이지 번호', example: 1 })
  @ApiQuery({ name: 'limit', type: Number, description: '페이지당 게시글 수', required: false, example: 10 })
  @ApiQuery({
    name: 'sort',
    type: String,
    enum: ['latest (최신순)', 'popular (인기순)', 'viewCounts (조회순)', 'oldest (작성순)'],
    description: '정렬 기준',
    required: false,
    example: 'latest',
  })
  @ApiResponse({
    status: 200,
    description: '본인의 게시글이 성공적으로 조회되었습니다.',
    schema: {
      example: [
        {
          items: [
            {
              postId: 25,
              boardType: 'job',
              title: '서울아산병원 신규 간호사 채용 공고',
              viewCounts: 100,
              likeCounts: 21,
              createdAt: '2024-09-20T05:33:35.689Z',
              numberOfCommentsAndReplies: 249,
            },
            {
              postId: 20,
              boardType: 'job',
              title: '분당 서울대병원 간호사 채용 공고',
              viewCounts: 2213,
              likeCounts: 18,
              createdAt: '2024-09-19T11:54:41.741Z',
              numberOfCommentsAndReplies: 21,
            },
          ],
          totalItems: 2,
          totalPages: 1,
          currentPage: 1,
        },
      ],
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
  async getMyPosts(@SessionUser() user: IUser, @Query() getMyPostsQueryDto: GetMyPostsQueryDto) {
    const { page, limit, sort } = getMyPostsQueryDto;
    return this.usersService.fetchMyPosts(user, page, limit, sort);
  }

  // 본인 댓글 및 답글 전체 조회
  @UseGuards(RegularMemberGuard)
  @Get('comments')
  @HttpCode(200)
  @ApiOperation({ summary: '본인 댓글 및 답글 전체 조회' })
  @ApiQuery({ name: 'page', type: Number, description: '페이지 번호', required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, description: '페이지당 댓글 수', required: false, example: 10 })
  @ApiQuery({
    name: 'sort',
    type: String,
    enum: ['latest (최신순)', 'popular (인기순)', 'viewCounts (조회순)', 'oldest (작성순)'],
    description: '원 게시물을 기준으로 정렬할 수 있는 필터 종류',
    required: false,
    example: 'latest',
  })
  @ApiResponse({
    status: 200,
    description: '댓글 및 답글이 성공적으로 조회되었습니다.',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', description: '댓글 또는 답글 타입' },
              commentId: { type: 'number', description: '댓글 ID' },
              replyId: { type: 'number', description: '답글 ID' },
              content: { type: 'string', description: '댓글 또는 답글 내용' },
              createdAt: { type: 'string', format: 'date-time', description: '작성 날짜' },
              postId: { type: 'number', description: '게시물 ID' },
              boardType: { type: 'string', description: '게시판 타입' },
              title: { type: 'string', description: '게시물 제목' },
              numberOfCommentsAndReplies: { type: 'number', description: '해당 게시물에 달린 댓글 및 답글 수' },
            },
          },
        },
        totalItems: { type: 'number', description: '총 아이템 수' },
        totalPages: { type: 'number', description: '총 페이지 수' },
        currentPage: { type: 'number', description: '현재 페이지 번호' },
      },
      example: {
        items: [
          {
            type: 'comment',
            commentId: 1,
            content: '이건 샘플 댓글이다.',
            createdAt: '2024-09-01T12:00:00Z',
            postId: 1,
            boardType: 'employment',
            title: '샘플 게시물 제목',
            numberOfCommentsAndReplies: 123,
          },
          {
            type: 'reply',
            replyId: 2,
            commentId: 1,
            content: '이건 샘플 답글이다.',
            createdAt: '2024-09-01T12:01:00Z',
            postId: 1,
            boardType: 'employment',
            title: '샘플 게시물 제목',
            numberOfCommentsAndReplies: 2,
          },
        ],
        totalItems: 2,
        totalPages: 1,
        currentPage: 1,
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
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: {
        statusCode: 400,
        message: '잘못된 요청입니다.',
      },
    },
  })
  async getMyCommentsAndReplies(@SessionUser() user: IUser, @Query() getmyCommentsQueryDto: GetMyCommentsQueryDto) {
    const { userId } = user;
    const { page, limit, sort } = getmyCommentsQueryDto;
    return this.usersService.fetchMyCommentsAndReplies(userId, page, limit, sort);
  }

  // 내가 스크랩한 게시물 조회
  @UseGuards(RegularMemberGuard)
  @Get('scraps')
  @HttpCode(200)
  @ApiOperation({ summary: '내가 스크랩한 게시물 조회' })
  @ApiQuery({ name: 'page', type: Number, description: '페이지 번호', required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, description: '페이지당 댓글 수', required: false, example: 10 })
  @ApiQuery({
    name: 'sort',
    type: String,
    enum: ['latest (최신순)', 'popular (인기순)', 'viewCounts (조회순)', 'oldest (작성순)'],
    description: '원 게시물을 기준으로 정렬할 수 있는 필터 종류',
    required: false,
    example: 'latest',
  })
  @ApiResponse({
    status: 200,
    description: '스크랩한 게시물 목록',
    schema: {
      example: {
        items: [
          {
            scrapId: 8,
            postId: 27,
            boardType: 'employment',
            title: '제목이다',
            viewCounts: 0,
            likeCounts: 9,
            createdAt: '2024-09-21T10:48:57.378Z',
            numberOfCommentsAndReplies: 10,
          },
          {
            scrapId: 12,
            postId: 3,
            boardType: 'notice',
            title: '나는 관리자다 이것들아',
            viewCounts: 0,
            likeCounts: 10,
            createdAt: '2024-09-13T10:59:00.450Z',
            numberOfCommentsAndReplies: 0,
          },
        ],
        totalItems: 14,
        totalPages: 2,
        currentPage: 1,
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
  async getScrapPosts(
    @SessionUser() sessionUser: IUser,
    @Query() getMyScrapsQueryDto: GetMyScrapsQueryDto,
  ): Promise<IPaginatedResponse<any>> {
    const { page, limit, sort } = getMyScrapsQueryDto;
    return await this.usersService.fetchMyScrapedPosts(sessionUser, page, limit, sort);
  }
}
