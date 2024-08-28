import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BoardType } from './enum/boardType.enum';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';
import { PaginateQueryDto } from './dto/get-post-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  //게시글 전체 및 검색 조회
  @Get(':boardType')
  async getPosts(
    @Param('boardType') boardType: BoardType,
    @Query()
    paginateQueryDto: PaginateQueryDto,
  ) {
    try {
      const result = await this.postsService.getPosts(
        boardType,
        paginateQueryDto,
      );

      return result;
    } catch (err) {
      throw err;
    }
  }
  //특정 게시글 조회
  @Get(':boardType/:id')
  async getPostDetails(
    @Param('boardType') boardType: BoardType,
    @Param('id') id: number,
  ) {
    try {
      const result = await this.postsService.getPostDetails(boardType, id);

      return result;
    } catch (err) {
      throw err;
    }
  }

  //게시글 생성
  @Post(':boardType')
  async createPost(
    @Param('boardType') boardType: BoardType,
    @Body() createPostDto: CreatePostDto,
  ) {
    try {
      //나중에 userId 추가
      const result = await this.postsService.createPost(
        boardType,
        createPostDto,
      );

      return result;
    } catch (err) {
      throw err;
    }
  }
  //게시글 수정
  @Patch(':boardType/:postId')
  async updatePost(
    @Param('boardType') boardType: BoardType,
    @Param('postId') postId: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    try {
      const result = await this.postsService.updatePost(
        boardType,
        postId,
        updatePostDto,
      );

      return result;
    } catch (err) {
      throw err;
    }
    //나중에 userId 추가
  }

  @Delete(':boardType/:postId')
  async softDeletePost(
    @Param('boardType') boardType: BoardType,
    @Param('postId') postId: number,
  ) {
    //나중에 userId 추가
    try {
      const result = await this.postsService.deletePost(boardType, postId);

      return result;
    } catch (err) {
      throw err;
    }
  }
}
