import { Controller, Delete, Get, HttpCode, HttpStatus, Post, UseGuards, Body, Param } from '@nestjs/common';
import { AdminGuard } from 'src/auth/guards';
import { AdminService } from './admin.service';
import { SuspensionUserDto } from './dto/suspension-user.dto';
import { DeletionUserDto, UserInfoDto } from './dto';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
    constructor (private readonly adminService: AdminService) {}

    // 관리자 회원 탈퇴 처리
    @Delete('withdrawal')
    @HttpCode(HttpStatus.OK)
    async deleteUserByAdmin(@Body() deleteUserDto: DeletionUserDto){
        await this.adminService.withdrawUserByAdmin(deleteUserDto);
    }

    // 관리자 회원 정지 처리
    @Post('suspension')
    @HttpCode(HttpStatus.OK)
    async postSuspensionByAdmin(suspensionUserDto: SuspensionUserDto){
        await this.adminService.suspendUserByAdmin(suspensionUserDto);
    }

    // 관리자 전체 회원 조회
    @Get('users')
    @HttpCode(HttpStatus.OK)
    async getAllUsers(){
        await this.adminService.fetchAllUsersByAdmin();
    }

    // 관리자 특정 회원 정보 조회
    @Get('user/:userId')
    @HttpCode(HttpStatus.OK)
    async getUserInfoByAdmin(@Param('userId') userId: number){
        await this.adminService.fetchUserInfoByAdmin(userId);
    }

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
