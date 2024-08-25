import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BoardType } from './enum/boardType.enum';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';
import { PaginateQueryDto } from './dto/get-post-query.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async getPosts(
    @Query('boardType') boardType: BoardType,
    @Query()
    paginateQueryDto: PaginateQueryDto,
  ) {
    const result = await this.postsService.getPosts(
      boardType,
      paginateQueryDto,
    );

    return result;
  }
  @Post()
  async CreatePost(
    @Query('boardType') boardType: BoardType,
    @Body() createPostDto: CreatePostDto,
  ) {
    //나중에 userId 추가
    const result = await this.postsService.createPost(boardType, createPostDto);

    return result;
  }
}
