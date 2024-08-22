import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BoardType } from './enum/boardType.enum';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async CreatePost(
    @Query('postType') postType: BoardType,
    @Body() createPostDto: CreatePostDto,
  ) {
    //나중에 userId 추가
    const result = await this.postsService.createPost(postType, createPostDto);

    return result;
  }
}
