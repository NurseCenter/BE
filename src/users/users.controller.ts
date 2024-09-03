import { Controller, Get, Patch } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('me')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // 본인 정보 조회
    @Get()
    async getMyInfo(){}

    // 본인 정보 수정
    @Patch()
    async patchMyInfo(){}

    // 본인 게시글 전체 조회
    @Get('/posts')
    async getMyPosts(){}

    // 본인 댓글 전체 조회
    @Get('/comments')
    async getMyComments(){}

    // 본인 스크랩 게시물 조회
    @Get('/scraps')
    async getMyScraps(){}
}
