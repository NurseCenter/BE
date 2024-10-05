import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { EBoardType } from './enum/board-type.enum';
import { PostsService } from './posts.service';
import { SessionUser } from '../auth/decorators/get-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { RegularMemberGuard } from '../auth/guards';
import { IPaginatedResponse } from 'src/common/interfaces';
import { GetPostsQueryDto, CreatePostDto, UpdatePostDto, ReportDto, BasePostDto } from './dto';
import { PostsEntity } from './entities/base-posts.entity';
import { IPostDetailResponse, IPostResponse } from './interfaces';
import { IReportedPostResponse } from 'src/reports/interfaces/users';
import { SuspensionGuard } from 'src/auth/guards/suspension.guard';
import { IUser } from 'src/auth/interfaces';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 총 게시물 수를 포함한 게시판별 게시물 수 조회 API
  @Get('count-by-category')
  @ApiOperation({ summary: '전체 게시판별 게시물 수 조회 (총 게시물 수 포함)' })
  @ApiOkResponse({
    description: '게시판별 게시물 수 조회',
    isArray: true,
    example: {
      '게시판별 게시물 수 예시': {
        summary: '게시판별 게시물 수',
        value: [
          { boardType: 'employment', count: 2 },
          { boardType: 'event', count: 0 },
          { boardType: 'exam', count: 1 },
          { boardType: 'job', count: 13 },
          { boardType: 'notice', count: 2 },
          { boardType: 'practice', count: 1 },
          { boardType: 'theory', count: 1 },
          { boardType: 'all', count: 20 },
        ],
      },
    },
  })
  async getAllPostsCountByCategory(): Promise<{ boardType: EBoardType; count: number }[]> {
    return this.postsService.getPostsCountByCategory();
  }

  // 특정 게시판의 게시물 수 조회 API
  @Get('count-by-category/:boardType')
  @ApiOperation({ summary: '특정 게시판의 게시물 수 조회' })
  @ApiResponse({
    status: 200,
    description: '특정 게시판의 게시물 수 조회',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              boardType: {
                type: 'string',
                enum: Object.values(EBoardType),
              },
              count: { type: 'integer' },
            },
          },
        },
        example: [{ boardType: 'all', count: 230 }],
      },
    },
  })
  async getPostsCountByCategory(
    @Param('boardType') boardType?: EBoardType,
  ): Promise<{ boardType: EBoardType; count: number }[]> {
    return this.postsService.getPostsCountByCategory(boardType);
  }

  // 게시글 전체 및 검색 조회
  @Get(':boardType')
  @ApiOperation({ summary: '전체 게시글 조회 및 검색' })
  @ApiParam({
    name: 'boardType',
    description: '게시판 종류',
    enum: EBoardType,
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 항목 수' })
  @ApiQuery({ name: 'search', required: false, type: String, description: '검색어' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: '정렬 순서' })
  @ApiQuery({ name: 'sortType', required: false, enum: ['DATE', 'LIKES'], description: '정렬 기준' })
  @ApiResponse({
    status: 200,
    description: '게시글 조회 성공',
    schema: {
      example: {
        items: [
          {
            postId: 1,
            boardType: 'employment',
            title: '취업에 성공하는 비결',
            createdAt: '2024-01-01T00:00:00.000Z',
            viewCounts: 100,
            likeCounts: 10,
            user: {
              userId: 37,
              nickname: '관리자2',
            },
            numberOfCommentsAndReplies: 23,
          },
        ],
        totalItems: 1,
        totalPages: 1,
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
        message: 'Limit은 50을 넘어갈 수 없습니다.',
      },
    },
  })
  async getPosts(
    @Param('boardType') boardType: EBoardType,
    @Query()
    getPostsQueryDto: GetPostsQueryDto,
  ): Promise<IPaginatedResponse<PostsEntity>> {
    try {
      const result = await this.postsService.getAllPosts(boardType, getPostsQueryDto);
      return result;
    } catch (err) {
      throw err;
    }
  }

  // 특정 게시글 조회
  @Get(':boardType/:postId')
  @HttpCode(200)
  @UseGuards(RegularMemberGuard)
  @ApiOperation({ summary: '특정 게시글 조회' })
  @ApiParam({ name: 'boardType', enum: EBoardType, description: '게시판 유형' })
  @ApiParam({ name: 'postId', type: Number, description: '게시글 ID' })
  @ApiResponse({
    status: 200,
    description: '게시글 조회 성공',
    schema: {
      example: {
        postId: 28,
        category: 'employment',
        title: '병원 이름 들어가는지 테스트',
        content: '본문 테스트',
        hospitalNames: ['서울대학교병원', '경북대학교병원'],
        likeCounts: 0,
        viewCounts: 1,
        createdAt: '2024-09-21T11:49:52.389Z',
        updatedAt: '2024-09-21T11:56:00.000Z',
        isLiked: false,
        isScraped: false,
        user: {
          userId: 35,
          nickname: '닉넴뭐하지',
        },
        numberOfComments: 25,
        images: [
          {
            imageId: 1,
            imageUrl: 'https://example.com/image1.jpg',
          },
          {
            imageId: 2,
            imageUrl: 'https://example.com/image2.jpg',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '게시글을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '게시글을 찾을 수 없습니다.',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: {
        statusCode: 400,
        message: '잘못된 요청 파라미터',
        error: 'Bad Request',
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
  async getPostDetails(
    @Param('boardType') boardType: EBoardType,
    @Param('postId') postId: number,
    @SessionUser() sessionUser: IUser,
  ): Promise<IPostDetailResponse> {
    try {
      const result = await this.postsService.getOnePost(boardType, postId, sessionUser);
      return result;
    } catch (err) {
      throw err;
    }
  }

  // 게시글 생성
  @UseGuards(RegularMemberGuard, SuspensionGuard)
  @Post(':boardType')
  @HttpCode(201)
  @ApiOperation({ summary: '게시글 생성' })
  @ApiParam({ name: 'boardType', enum: EBoardType, description: '게시판 유형' })
  @ApiBody({
    description: '게시글 생성 데이터',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: '새 게시글 제목',
        },
        content: {
          type: 'string',
          example: '새 게시글 내용',
        },
        imageTypes: {
          type: 'array',
          items: {
            type: 'string',
            example: 'image/jpeg',
          },
          example: ['image/jpeg'],
        },
        hospitalName: {
          type: 'string',
          example: '서울대학교병원',
        },
      },
      required: ['title', 'content'],
    },
    examples: {
      텍스트만: {
        summary: '첨부파일 없이 텍스트만 포함된 게시글',
        value: {
          title: '새 게시글 제목',
          content: '새 게시글 내용입니다. 텍스트만 있습니다.',
          hospitalName: '서울대학교병원',
        },
      },
      '첨부파일 포함': {
        summary: '첨부파일을 포함한 게시글',
        value: {
          title: '새 게시글 제목',
          content: '새 게시글 내용입니다. 첨부파일을 함께 등록하면 imageTypes에 파일의 타입이 들어갑니다.',
          imageTypes: ['image/jpeg'],
          hospitalName: '서울대학교병원',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '게시글 생성 성공',
    schema: {
      example: {
        postId: 2,
        userId: 1,
        title: '새 게시글 제목',
        content: '내용이 보입니다. 100자 넘어가면 ... 처리됩니다.',
        hospitalNames: ['서울대학교병원'],
        createdAt: '2024-01-02T00:00:00.000Z',
        presignedPostData: [
          {
            url: 'https://example.com/upload',
            fields: {
              key: 'image-key',
              policy: 'policy',
              signature: 'signature',
            },
            key: 'image-key',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: {
        statusCode: 400,
        message: '잘못된 요청',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    schema: {
      example: {
        statusCode: 401,
        message: '인증 실패',
      },
    },
  })
  async createPost(
    @Param('boardType') boardType: EBoardType,
    @Body() createPostDto: CreatePostDto,
    @SessionUser() sessionUser: IUser,
  ): Promise<IPostResponse> {
    try {
      const result = await this.postsService.createPost(boardType, createPostDto, sessionUser);
      return result;
    } catch (err) {
      throw err;
    }
  }

  // 게시글 수정
  @UseGuards(RegularMemberGuard, SuspensionGuard)
  @Put(':boardType/:postId')
  @HttpCode(200)
  @ApiOperation({ summary: '게시글 수정' })
  @ApiParam({ name: 'boardType', enum: EBoardType, description: '게시판 유형' })
  @ApiParam({ name: 'postId', type: Number, description: '게시글 ID' })
  @ApiBody({
    description: '게시글 수정 데이터',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: '수정된 게시글 제목',
        },
        content: {
          type: 'string',
          example: '수정된 게시글 내용',
        },
        imageTypes: {
          type: 'array',
          items: {
            type: 'string',
            example: 'image/jpeg',
          },
          example: ['image/jpeg'],
        },
      },
      required: ['title', 'content'],
    },
    examples: {
      텍스트만: {
        summary: '이미지 없이 텍스트만 포함된 게시글',
        value: {
          title: '수정된 게시글 제목이죵',
          content: '수정된 게시글 내용입니당',
        },
      },
      '이미지 포함': {
        summary: '이미지를 포함한 게시글',
        value: {
          title: '수정된 게시글 제목이죵',
          content:
            '수정된 게시글 내용입니당. 이미지가 포함되면 imageTypes에 이미지 타입이 들어갑니당. 내용은 여기에 들어가용',
          imageTypes: ['image/jpeg'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '게시글 수정 성공',
    schema: {
      example: {
        postId: 2,
        userId: 35,
        title: '새 게시글 제목',
        content: '내용이 보입니다. 100자 넘어가면 ... 처리됩니다.',
        hospitalNames: ['서울대학교병원'],
        createdAt: '2024-01-02T00:00:00.000Z',
        presignedPostData: [
          {
            url: 'https://example.com/upload',
            fields: {
              key: 'image-key',
              policy: 'policy',
              signature: 'signature',
            },
            key: 'image-key',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: {
        statusCode: 400,
        message: '잘못된 요청',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    schema: {
      example: {
        statusCode: 401,
        message: '인증 실패',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음',
    schema: {
      example: {
        statusCode: 403,
        message: '이 게시물을 수정할 권한이 없습니다.',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '게시글을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '이벤트 게시판에서 1번 게시물을 찾을 수 없습니다.',
      },
    },
  })
  async updatePost(
    @Param('boardType') boardType: EBoardType,
    @Param('postId') postId: number,
    @Body() updatePostDto: UpdatePostDto,
    @SessionUser() sessionUser: IUser,
  ): Promise<IPostResponse> {
    try {
      const result = await this.postsService.updatePost(boardType, postId, updatePostDto, sessionUser);
      return result;
    } catch (err) {
      throw err;
    }
  }

  // 게시글 삭제
  @UseGuards(RegularMemberGuard, SuspensionGuard)
  @Delete(':boardType/:postId')
  @HttpCode(200)
  @ApiOperation({ summary: '게시글 삭제' })
  @ApiParam({
    name: 'boardType',
    description: '게시판 종류',
    enum: EBoardType,
  })
  @ApiParam({
    name: 'postId',
    description: '게시글 ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: '게시글 삭제 성공',
    schema: {
      example: { message: '게시물이 삭제되었습니다.' },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    schema: {
      example: {
        statusCode: 401,
        message: '인증 실패',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음',
    schema: {
      example: {
        statusCode: 403,
        message: '이 게시물을 삭제할 권한이 없습니다.',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '게시글을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '이벤트 게시판에서 1번 게시물을 찾을 수 없습니다.',
      },
    },
  })
  async deletePost(
    @Param('boardType') boardType: EBoardType,
    @Param('postId') postId: number,
    @SessionUser() sessionUser: IUser,
  ): Promise<{ message: string }> {
    try {
      const result = await this.postsService.deletePost(boardType, postId, sessionUser);
      return result;
    } catch (err) {
      throw err;
    }
  }

  // 특정 게시글 신고
  @UseGuards(RegularMemberGuard, SuspensionGuard)
  @Post(':boardType/:postId/reports')
  @HttpCode(200)
  @ApiOperation({ summary: '특정 게시글 신고' })
  @ApiParam({
    name: 'boardType',
    description: '게시판 종류',
    enum: EBoardType,
  })
  @ApiParam({
    name: 'postId',
    description: '게시글 ID',
    type: Number,
  })
  @ApiBody({
    description: '신고 데이터',
    type: ReportDto,
    schema: {
      type: 'object',
      properties: {
        reportedReason: {
          type: 'string',
          enum: ['PORNOGRAPHY', 'SLANDER', 'SPAM', 'OTHER'],
        },
        otherReportedReason: {
          type: 'string',
          nullable: true,
        },
      },
      examples: {
        example1: {
          summary: '항목 중 선택할 경우',
          value: {
            reportedReason: 'SPAM',
            otherReportedReason: null,
          },
        },
        example2: {
          summary: "'OTHER' 항목 선택할 경우",
          value: {
            reportedReason: 'OTHER',
            otherReportedReason: '기타 사유를 100자 이내로 입력하면 됨',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '게시글 신고 성공',
    schema: {
      example: {
        reportPostId: 1, // 신고 ID
        postId: 1, // 게시글 ID
        userId: 1, // 신고한 사용자 ID
        reportedReason: 'spam', // 신고 이유
        otherReportedReason: null, // 기타 신고 이유
        reportedUserId: 2, // 신고된 사용자 ID
        createdAt: '2024-01-01T00:00:00.000Z', // 신고 일자
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
        message: '인증 실패',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '본인 게시물 신고 시',
    schema: {
      example: {
        statusCode: 403,
        message: '본인의 게시물은 본인이 신고할 수 없습니다.',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '게시글을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '이벤트 게시판의 1번 게시물을 찾을 수 없습니다.',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: '이미 신고한 게시물',
    schema: {
      example: {
        statusCode: 409,
        message: '이미 신고한 게시물입니다.',
      },
    },
  })
  async reportPost(
    @Param() basePostDto: BasePostDto,
    @SessionUser() sessionUser: IUser,
    @Body() reportDto: ReportDto,
  ): Promise<IReportedPostResponse> {
    const result = await this.postsService.reportPost(basePostDto, sessionUser, reportDto);
    return result;
  }
}
