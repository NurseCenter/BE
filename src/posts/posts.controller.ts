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
import { ESortOrder, ESortType } from './enum/sort-type.enum';
@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  //게시글 전체 및 검색 조회
  @Get(':boardType')
  @HttpCode(200)
  @ApiOperation({ summary: '게시글 전체 및 검색 조회' })
  @ApiParam({ name: 'boardType', enum: EBoardType, description: '게시판 유형' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 항목 수' })
  @ApiQuery({ name: 'search', type: String, required: false, description: '검색어' })
  @ApiQuery({ name: 'sortOrder', enum: ESortOrder, required: false, description: '정렬 순서' })
  @ApiQuery({ name: 'sortType', enum: ESortType, required: false, description: '정렬 기준' })
  @ApiResponse({ status: 200, description: '게시글 목록 조회 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
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
  //특정 게시글 조회
  @Get(':boardType/:id')
  @HttpCode(200)
  @UseGuards(RegularMemberGuard)
  @ApiOperation({ summary: '특정 게시글 조회' })
  @ApiParam({ name: 'boardType', enum: EBoardType, description: '게시판 유형' })
  @ApiParam({ name: 'id', type: Number, description: '게시글 ID' })
  @ApiResponse({ status: 200, description: '게시글 조회 성공' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async getPostDetails(@Param('boardType') boardType: EBoardType, @Param('id') id: number) {
    try {
      const result = await this.postsService.getPostDetails(boardType, id);

      return result;
    } catch (err) {
      throw err;
    }
  }

  //게시글 생성
  @Post(':boardType')
  @HttpCode(201)
  @UseGuards(RegularMemberGuard)
  @ApiOperation({ summary: '게시글 생성' })
  @ApiParam({ name: 'boardType', enum: EBoardType, description: '게시판 유형' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ status: 201, description: '게시글 생성 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증 실패' })
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
  //게시글 수정
  @Patch(':boardType/:postId')
  @HttpCode(200)
  @UseGuards(RegularMemberGuard)
  @ApiOperation({ summary: '게시글 수정' })
  @ApiParam({ name: 'boardType', enum: EBoardType, description: '게시판 유형' })
  @ApiParam({ name: 'postId', type: Number, description: '게시글 ID' })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({ status: 200, description: '게시글 수정 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
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
    //나중에 userId 추가
  }
  //게시글 삭제
  @Delete(':boardType/:postId')
  @HttpCode(200)
  @UseGuards(RegularMemberGuard)
  @ApiOperation({ summary: '게시글 삭제' })
  @ApiParam({ name: 'boardType', enum: EBoardType, description: '게시판 유형' })
  @ApiParam({ name: 'postId', type: Number, description: '게시글 ID' })
  @ApiResponse({ status: 200, description: '게시글 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async softDeletePost(
    @Param('boardType') boardType: EBoardType,
    @Param('postId') postId: number,
    @SessionUser() sessionUser: IUserWithoutPassword,
  ) {
    //나중에 userId 추가
    try {
      const result = await this.postsService.deletePost(boardType, postId, sessionUser);

      return result;
    } catch (err) {
      throw err;
    }
  }

  //특정 게시글 신고
  @Post(':boardType/:postId/reports')
  @HttpCode(200)
  @UseGuards(RegularMemberGuard)
  @ApiOperation({ summary: '특정 게시글 신고' })
  @ApiParam({ name: 'boardType', enum: EBoardType, description: '게시판 유형' })
  @ApiParam({ name: 'postId', type: Number, description: '게시글 ID' })
  @ApiBody({ type: ReportPostDto })
  @ApiResponse({ status: 200, description: '게시글 신고 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '자신의 게시글 신고 불가' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '이미 신고한 게시글' })
  async reportPost(
    @Param() basePostDto: BasePostDto,
    @SessionUser() sessionUser: IUserWithoutPassword,
    @Body() reportPostDto: ReportPostDto,
  ) {
    const result = await this.postsService.reportPost(basePostDto, sessionUser, reportPostDto);
    return result;
  }
}
