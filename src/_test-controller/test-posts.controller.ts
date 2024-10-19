import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreatePostDto, UpdatePostDto } from 'src/posts/dto';
import { EBoardType } from 'src/posts/enum/board-type.enum';
import { IPostResponse } from 'src/posts/interfaces';
import { TestPostsService } from './test-posts.service';

@ApiTags('Test')
@Controller('test-posts')
export class TestPostsController {
  constructor(private readonly testPostsService: TestPostsService) {}

  // 특정 게시글 조회
  @Get(':boardType/:postId')
  @HttpCode(200)
  @ApiOperation({ summary: '[테스트] 특정 게시글 조회, userId = 10041004' })
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
        user: {
          userId: 35,
          nickname: '닉넴뭐하지',
        },
        numberOfComments: 25,
        fileUrls: [
          'https://example.s3.ap-northeast-2.amazonaws.com/images/sample.png',
          'https://example.s3.ap-northeast-2.amazonaws.com/images/sample2.png',
          'https://example.s3.ap-northeast-2.amazonaws.com/images/sample3.png',
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
  async getPostDetails(@Param('boardType') boardType: EBoardType, @Param('postId') postId: number) {
    try {
      const result = await this.testPostsService.getOnePost(boardType, postId);
      return result;
    } catch (err) {
      throw err;
    }
  }

  // 게시글 생성
  @Post(':boardType')
  @HttpCode(201)
  @ApiOperation({ summary: '[테스트] 게시글 생성, userId = 10041004' })
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
          example: '<p>새 게시글 내용입니다. <strong>간호사 취업 잘 하는 방법</strong>은 무엇일까요?</p>',
        },
        fileUrls: {
          type: 'array',
          items: {
            type: 'string',
            example: 'https://example.s3.ap-northeast-2.amazonaws.com/images/sample.png',
          },
        },
        hospitalNames: {
          type: 'array',
          items: {
            type: 'string',
            example: '서울대학교병원',
          },
        },
      },
      required: ['title', 'content'],
    },
    examples: {
      '제목과 내용만 존재': {
        summary: '제목과 내용만 포함된 게시글',
        value: {
          title: '새 게시글 제목',
          content: '<p>새 게시글 내용입니다. <strong>간호사 취업 잘 하는 방법</strong>은 무엇일까요?</p>',
        },
      },
      '제목, 내용, 병원명 포함': {
        summary: '제목, 내용, 병원명이 포함된 게시글',
        value: {
          title: '새 게시글 제목',
          content: '<p>새 게시글 내용입니다. <strong>간호사 취업 잘 하는 방법</strong>은 무엇일까요?</p>',
          hospitalNames: ['서울대학교병원', '아주대학교병원', '연세의료원'],
        },
      },
      '제목, 내용, 첨부파일, 병원명 포함': {
        summary: '첨부파일을 포함한 게시글',
        value: {
          title: '새 게시글 제목',
          content: '<p>새 게시글 내용입니다. <strong>간호사 취업 잘 하는 방법</strong>은 무엇일까요?</p>',
          fileUrls: [
            'https://example.s3.ap-northeast-2.amazonaws.com/images/2024/10/13/sl2psdlksg.png',
            'https://example.s3.ap-northeast-2.amazonaws.com/images/2024/10/13/sl2ps20395230961ksg.png',
          ],
          hospitalNames: ['서울대학교병원', '서울성모병원'],
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
        content: '<p>새 게시글 내용입니다. <strong>간호사 취업 잘 하는 방법</strong>은 무엇일까요?</p>',
        hospitalNames: ['서울대학교병원'],
        createdAt: '2024-01-02T00:00:00.000Z',
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
  ): Promise<IPostResponse> {
    try {
      console.log('컨트롤러의 boardType: ', boardType);

      const result = await this.testPostsService.createPost(boardType, createPostDto);
      return result;
    } catch (err) {
      throw err;
    }
  }

  // 게시글 수정
  @Put(':boardType/:postId')
  @HttpCode(200)
  @ApiOperation({ summary: '[테스트] 게시글 수정, userId = 10041004' })
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
          example: '<p>수정된 게시글 내용입니다. <strong>간호사 취업 잘 하는 방법</strong>은 무엇일까요?</p>',
        },
        fileUrls: {
          type: 'array',
          items: {
            type: 'string',
            example: 'https://example.s3.ap-northeast-2.amazonaws.com/images/sample.png',
          },
        },
        hospitalNames: {
          type: 'array',
          items: {
            type: 'string',
            example: '서울대학교병원',
          },
        },
      },
    },
    examples: {
      '제목과 내용만 존재': {
        summary: '제목과 내용만 포함된 게시글',
        value: {
          title: '수정된 게시글 제목',
          content: '<p>수정된 게시글 내용입니다. <strong>간호사 취업 잘 하는 방법</strong>은 무엇일까요?</p>',
        },
      },
      '제목, 내용, 병원명 포함': {
        summary: '제목, 내용, 병원명이 포함된 게시글',
        value: {
          title: '수정된 게시글 제목',
          content: '<p>수정된 게시글 내용입니다. <strong>간호사 취업 잘 하는 방법</strong>은 무엇일까요?</p>',
          hospitalNames: ['서울대학교병원', '아주대학교병원', '연세의료원'],
        },
      },
      '제목, 내용, 첨부파일, 병원명 포함': {
        summary: '첨부파일을 포함한 게시글',
        value: {
          title: '수정된 게시글 제목',
          content: '<p>수정된 게시글 내용입니다. <strong>간호사 취업 잘 하는 방법</strong>은 무엇일까요?</p>',
          fileUrls: [
            'https://example.s3.ap-northeast-2.amazonaws.com/images/2024/10/13/sl2psdlksg.png',
            'https://example.s3.ap-northeast-2.amazonaws.com/images/2024/10/13/sl2ps20395230961ksg.png',
          ],
          hospitalNames: ['서울대학교병원', '서울성모병원'],
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
        content: '<p>수정된 게시글 내용입니다. <strong>간호사 취업 잘 하는 방법</strong>은 무엇일까요?</p>',
        hospitalNames: ['서울대학교병원'],
        createdAt: '2024-01-02T00:00:00.000Z',
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
  ): Promise<IPostResponse | { message: string }> {
    try {
      const result = await this.testPostsService.updatePost(boardType, postId, updatePostDto);
      return result;
    } catch (err) {
      throw err;
    }
  }

  // 게시글 삭제
  @Delete(':boardType/:postId')
  @HttpCode(200)
  @ApiOperation({ summary: '[테스트] 게시글 삭제, userId = 10041004' })
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
  ): Promise<{ message: string }> {
    try {
      const result = await this.testPostsService.deletePost(boardType, postId);
      return result;
    } catch (err) {
      throw err;
    }
  }
}
