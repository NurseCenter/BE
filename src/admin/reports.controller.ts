import { Controller, Delete, Get, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { AdminGuard } from 'src/auth/guards';

@Controller('reports')
export class ReportsController {
    constructor () {}

    // 신고된 게시물 전체 조회
    @UseGuards(AdminGuard)
    @Get('posts')
    @HttpCode(HttpStatus.OK)
    async getAllReportedPosts() {
    }

    // 신고된 특정 게시물 조회
    @UseGuards(AdminGuard)
    @Get('posts/:postId')
    @HttpCode(HttpStatus.OK)
    async getReportedPost(@Param('postId') postId: string){
    }

    // 신고된 특정 게시물 삭제
    @UseGuards(AdminGuard)
    @Delete('posts/:postId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteReportedPost(@Param('postId') postId: string){
    }

    // 신고된 댓글 전체 조회
    @UseGuards(AdminGuard)
    @Get('comments')
    @HttpCode(HttpStatus.OK)
    async getAllReportedComments(): Promise<any> {
    }

    // 신고된 특정 댓글 조회
    @UseGuards(AdminGuard)
    @Get('comments/:commentId')
    @HttpCode(HttpStatus.OK)
    async getReportedComment(@Param('commentId') commentId: string){
    }

    // 신고된 특정 댓글 삭제
    @UseGuards(AdminGuard)
    @Delete('comments/:commentId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteReportedComment(@Param('commentId') commentId: string) {
    }
}