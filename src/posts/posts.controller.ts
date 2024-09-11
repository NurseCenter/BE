import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { EBoardType } from './enum/board-type.enum';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';
import { PaginateQueryDto } from './dto/get-post-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { SessionUser } from '../auth/decorators/get-user.decorator';
import { IUserWithoutPassword } from '../auth/interfaces/session-decorator.interface';
import { BasePostDto } from './dto/base-post.dto';
import { ReportPostDto } from './dto/report-post.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { RegularMemberGuard } from '../auth/guards';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 게시글 전체 및 검색 조회
  @Get(':boardType')
  @ApiOperation({ summary: '게시글 조회' })
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
        posts: [
          {
            postId: 1,
            boardType: "employment",
            title: "취업에 성공하는 비결",
            nickname: "명란젓코난",
            createdAt: "2024-01-01T00:00:00.000Z",
            viewCounts: 100,
            like: 10,
          }
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: {
        statusCode: 400,
        message: "Limit은 50을 넘어갈 수 없습니다."
      }
    }
  })
  async getPosts(
    @Param('boardType') boardType: EBoardType,
    @Query()
    paginateQueryDto: PaginateQueryDto,
  ) {
    try {
      const result = await this.postsService.getPosts(boardType, paginateQueryDto);

      return result;
    } catch (err) {
      throw err;
    }
  }

  // 특정 게시글 조회
  @UseGuards(RegularMemberGuard)
  @Get(':boardType/:postId')
  @ApiOperation({ summary: '특정 게시글 조회' })
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
    description: '게시글 조회 성공',
    schema: {
      example: {
        postId: 1,
        userId: 1,
        title: "Post Title",
        content: "Post Content",
        like: 10,
        viewCounts: 101,
        createdAt: "2024-01-01T00:00:00.000Z",
        images: [
          {
            url: "https://example.com/image.jpg",
            postId: 1
          }
        ]
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: '게시글을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: "이벤트 게시판에서 1번 게시물을 찾을 수 없습니다."
      }
    }
  })
  async getPostDetails(@Param('boardType') boardType: EBoardType, @Param('postId') postId: number) {
    try {
      const result = await this.postsService.getPostDetails(boardType, postId);

      return result;
    } catch (err) {
      throw err;
    }
  }

  // 게시글 생성
  @UseGuards(RegularMemberGuard)
  @Post(':boardType')
  @HttpCode(201)
  @ApiOperation({ summary: '게시글 생성' })
  @ApiParam({ name: 'boardType', enum: EBoardType, description: '게시판 유형' })
  @ApiBody({
    description: '게시글 생성 데이터',
    type: CreatePostDto,
    schema: {
      example: {
        title: "New Post Title",
        content: "New Post Content",
        imageTypes: ["image/jpeg"]
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: '게시글 생성 성공',
    schema: {
      example: {
        postId: 2,
        userId: 1,
        title: "New Post Title",
        content: "New Post Content",
        like: 0,
        viewCounts: 0,
        createdAt: "2024-01-02T00:00:00.000Z",
        presignedPostData: [
          {
            url: "https://example.com/upload",
            fields: {
              key: "image-key",
              policy: "policy",
              signature: "signature"
            },
            key: "image-key"
          }
        ]
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: {
        statusCode: 400,
        message: "잘못된 요청"
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    schema: {
      example: {
        statusCode: 401,
        message: "인증 실패"
      }
    }
  })
  async createPost(
    @Param('boardType') boardType: EBoardType,
    @Body() createPostDto: CreatePostDto,
    @SessionUser() sessionUser: IUserWithoutPassword,
  ) {
    try {
      const result = await this.postsService.createPost(boardType, createPostDto, sessionUser);

      return result;
    } catch (err) {
      throw err;
    }
  }

  // 게시글 수정
  @UseGuards(RegularMemberGuard)
  @Patch(':boardType/:postId')
  @HttpCode(200)
  @ApiOperation({ summary: '게시글 수정' })
  @ApiParam({ name: 'boardType', enum: EBoardType, description: '게시판 유형' })
  @ApiParam({ name: 'postId', type: Number, description: '게시글 ID' })
  @ApiBody({
    description: '게시글 수정 데이터',
    type: UpdatePostDto,
    schema: {
      example: {
        title: "게시글 수정했답",
        content: "이게 바로 수정한 게시글 내용이다!"
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: '게시글 수정 성공',
    schema: {
      example: {
        postId: 1,
        userId: 1,
        title: "Updated Post Title",
        content: "Updated Post Content",
        like: 10,
        viewCounts: 100,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z"
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: {
        statusCode: 400,
        message: "잘못된 요청"
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    schema: {
      example: {
        statusCode: 401,
        message: "인증 실패"
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음',
    schema: {
      example: {
        statusCode: 403,
        message: "이 게시물을 수정할 권한이 없습니다."
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: '게시글을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: "이벤트 게시판에서 1번 게시물을 찾을 수 없습니다."
      }
    }
  })
  async updatePost(
    @Param('boardType') boardType: EBoardType,
    @Param('postId') postId: number,
    @Body() updatePostDto: UpdatePostDto,
    @SessionUser() sessionUser: IUserWithoutPassword,
  ) {
    try {
      const result = await this.postsService.updatePost(boardType, postId, updatePostDto, sessionUser);

      return result;
    } catch (err) {
      throw err;
    }
  }

  // 게시글 삭제
  @UseGuards(RegularMemberGuard)
  @Delete(':boardType/:postId')
  @HttpCode(204)
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
      example: {
        affected: 1
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    schema: {
      example: {
        statusCode: 401,
        message: "인증 실패"
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음',
    schema: {
      example: {
        statusCode: 403,
        message: "이 게시물을 삭제할 권한이 없습니다."
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: '게시글을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: "이벤트 게시판에서 1번 게시물을 찾을 수 없습니다."
      }
    }
  })
  async softDeletePost(
    @Param('boardType') boardType: EBoardType,
    @Param('postId') postId: number,
    @SessionUser() sessionUser: IUserWithoutPassword,
  ) {
    try {
      const result = await this.postsService.deletePost(boardType, postId, sessionUser);

      return result;
    } catch (err) {
      throw err;
    }
  }

  // 특정 게시글 신고
  @UseGuards(RegularMemberGuard)
  @Post(':boardType/:postId/reports')
  @HttpCode(200)
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
    type: ReportPostDto,
    schema: {
      example: {
        reportedReason: 'SPAM',
        otherReportedReason: null
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: '게시글 신고 성공',
    schema: {
      example: {
        reportId: 1,
        postId: 1,
        userId: 1,
        reportedReason: 'SPAM',
        otherReportedReason: null,
        reportedUserId: 2,
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: {
        statusCode: 400,
        message: '신고 사유를 기입해주세요.'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    schema: {
      example: {
        statusCode: 401,
        message: '인증 실패'
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: '자기 게시물 신고 시',
    schema: {
      example: {
        statusCode: 403,
        message: '자기 자신의 게시물을 신고할 수 없습니다.'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: '게시글을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '이벤트 게시판의 1번 게시물을 찾을 수 없습니다.'
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: '이미 신고한 게시물',
    schema: {
      example: {
        statusCode: 409,
        message: '이미 신고한 게시물입니다.'
      }
    }
  })
  async reportPost(
    @Param() basePostDto: BasePostDto,
    @SessionUser() sessionUser: IUserWithoutPassword,
    @Body() reportPostDto: ReportPostDto,
  ) {
    const result = await this.postsService.reportPost(basePostDto, sessionUser, reportPostDto);
    return result;
  }
}
