import { Controller, Delete, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from 'src/auth/guards';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
    constructor () {}

    // 관리자 회원 탈퇴 처리
    @Delete('withdrawal')
    @HttpCode(HttpStatus.OK)
    async deleteUserByAdmin(){}

    // 관리자 회원 정지 처리
    @Post('suspension')
    @HttpCode(HttpStatus.OK)
    async postSuspensionByAdmin(){}

    // 관리자 회원 가입 승인
    @Post('approval')
    @HttpCode(HttpStatus.OK)
    async postApprovalByAdmin(){}

    // 관리자 게시물 전체 조회
    @Get('posts')
    @HttpCode(HttpStatus.OK)
    async getAllPosts(){}

    // 관리자 특정 게시물 삭제
    @Delete('posts/:postId')
    @HttpCode(HttpStatus.OK)
    async deletePost(){}

    // 관리자 특정 게시물 검색
    @Get('posts/:postId')
    @HttpCode(HttpStatus.OK)
    async getSearchPost(){}

    // 관리자 댓글 전체 조회
    @Get('posts/:postId')
    @HttpCode(HttpStatus.OK)
    async getAllComments(){}

    // 관리자 특정 댓글 삭제
    @Get('comments/:commentId')
    @HttpCode(HttpStatus.OK)
    async deleteComment(){}
        

}
