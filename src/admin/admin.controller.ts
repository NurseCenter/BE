import { Controller, Delete, Get, HttpCode, HttpStatus, Post, UseGuards, Body, Param, Query } from '@nestjs/common';
import { AdminGuard } from 'src/auth/guards';
import { AdminService } from './admin.service';
import { SuspensionUserDto } from './dto/suspension-user.dto';
import { DeletionUserDto, UserInfoDto } from './dto';
import { ApprovalDto } from './dto/approval.dto';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 관리자 회원 탈퇴 처리
  @UseGuards(AdminGuard)
  @Delete('withdrawal')
  @HttpCode(HttpStatus.OK)
  async deleteUserByAdmin(@Body() deleteUserDto: DeletionUserDto) {
    await this.adminService.withdrawUserByAdmin(deleteUserDto);
  }

  // 관리자 회원 정지 처리
  @UseGuards(AdminGuard)
  @Post('suspension')
  @HttpCode(HttpStatus.OK)
  async postSuspensionByAdmin(suspensionUserDto: SuspensionUserDto) {
    await this.adminService.suspendUserByAdmin(suspensionUserDto);
  }

  // 관리자 전체 회원 조회
  @UseGuards(AdminGuard)
  @Get('users')
  @HttpCode(HttpStatus.OK)
  async getAllUsers(@Query() pageNumber: number, pageSize: number = 10) {
    await this.adminService.fetchAllUsersByAdmin(pageNumber, pageSize);
  }

  // 관리자 특정 회원 정보 조회
  @UseGuards(AdminGuard)
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  async getUserInfoByAdmin(@Param('userId') userId: number) {
    await this.adminService.fetchUserInfoByAdmin(userId);
  }

  // 관리자 회원 가입 승인 화면 데이터 조회
  @UseGuards(AdminGuard)
  @Get('approval')
  @HttpCode(HttpStatus.OK)
  async getApprovalsByAdmin(@Query() pageNumber: number, pageSize: number = 10) {
    await this.adminService.showUserApprovals(pageNumber, pageSize);
  }

  // 관리자 회원 가입 승인
  @UseGuards(AdminGuard)
  @Post('approval')
  @HttpCode(HttpStatus.OK)
  async postApprovalByAdmin(@Body() approvalDto: ApprovalDto) {
    await this.adminService.processUserApproval(approvalDto);
  }

  // 관리자 게시물 전체 조회
  @UseGuards(AdminGuard)
  @Get('posts')
  @HttpCode(HttpStatus.OK)
  async getAllPosts() {}

  // 관리자 특정 게시물 삭제
  @UseGuards(AdminGuard)
  @Delete('posts/:postId')
  @HttpCode(HttpStatus.OK)
  async deletePost() {}

  // 관리자 특정 게시물 검색
  @UseGuards(AdminGuard)
  @Get('posts/:postId')
  @HttpCode(HttpStatus.OK)
  async getSearchPost() {}

  // 관리자 댓글 전체 조회
  @UseGuards(AdminGuard)
  @Get('comments')
  @HttpCode(HttpStatus.OK)
  async getAllComments() {}

  // 관리자 특정 댓글 삭제
  @UseGuards(AdminGuard)
  @Get('comments/:commentId')
  @HttpCode(HttpStatus.OK)
  async deleteComment() {}
}
