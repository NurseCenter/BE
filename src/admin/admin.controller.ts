import { Controller, Delete, Get, HttpCode, HttpStatus, Post, UseGuards, Body, Param, Query } from '@nestjs/common';
import { AdminGuard } from 'src/auth/guards';
import { AdminService } from './admin.service';
import { SuspensionUserDto } from './dto/suspension-user.dto';
import { ApprovalUserDto, DeletionUserDto } from './dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response-interface';
import { IApprovalUserList, IPostList, IUserInfo, IUserList } from './interfaces';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 관리자 회원 탈퇴 처리
  @UseGuards(AdminGuard)
  @Delete('withdrawal')
  @HttpCode(HttpStatus.OK)
  async deleteUserByAdmin(@Body() deleteUserDto: DeletionUserDto): Promise<{ message: string }> {
    await this.adminService.withdrawUserByAdmin(deleteUserDto);
    return { message: '회원 탈퇴 처리가 완료되었습니다.' };
  }

  // 관리자 회원 정지 처리
  @UseGuards(AdminGuard)
  @Post('suspension')
  @HttpCode(HttpStatus.OK)
  async postSuspensionByAdmin(suspensionUserDto: SuspensionUserDto): Promise<{ message: string }> {
    await this.adminService.suspendUserByAdmin(suspensionUserDto);
    return { message: '회원 정지 처리가 완료되었습니다.' };
  }

  // 관리자 전체 회원 조회
  @UseGuards(AdminGuard)
  @Get('users')
  @HttpCode(HttpStatus.OK)
  async getAllUsers(@Query() pageNumber: number, pageSize: number = 10): Promise<PaginatedResponse<IUserList>> {
    const result = await this.adminService.fetchAllUsersByAdmin(pageNumber, pageSize);
    return result;
  }

  // 관리자 특정 회원 정보 조회
  @UseGuards(AdminGuard)
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  async getUserInfoByAdmin(@Param('userId') userId: number): Promise<IUserInfo> {
    return await this.adminService.fetchUserInfoByAdmin(userId);
  }

  // 관리자 회원 가입 승인 화면 데이터 조회
  @UseGuards(AdminGuard)
  @Get('approval')
  @HttpCode(HttpStatus.OK)
  async getApprovalsByAdmin(
    @Query() pageNumber: number,
    pageSize: number = 10,
  ): Promise<PaginatedResponse<IApprovalUserList>> {
    return await this.adminService.showUserApprovals(pageNumber, pageSize);
  }

  // 관리자 회원 가입 승인
  @UseGuards(AdminGuard)
  @Post('approval')
  @HttpCode(HttpStatus.OK)
  async postApprovalByAdmin(@Body() approvalDto: ApprovalUserDto) {
    const result = await this.adminService.processUserApproval(approvalDto);
    return result;
  }

  // 관리자 게시물 전체 조회
  @UseGuards(AdminGuard)
  @Get('posts')
  @HttpCode(HttpStatus.OK)
  async getAllPosts(
    @Query('pageNumber') pageNumber: number,
    @Query('pageSize') pageSize: number = 10,
  ): Promise<PaginatedResponse<IPostList>> {
    return this.adminService.getAllPosts(pageNumber, pageSize);
  }

  // 관리자 특정 게시물 삭제
  @UseGuards(AdminGuard)
  @Delete('posts/:postId')
  @HttpCode(HttpStatus.OK)
  async deletePost(@Param('postId') postId: number): Promise<{ message: string }> {
    await this.adminService.deletePost(postId);
    return { message: '게시물이 성공적으로 삭제되었습니다.' };
  }

  // 관리자 특정 게시물 검색
  // @Get('posts/:postId')
  // @HttpCode(HttpStatus.OK)
  // async getSearchPost(@Param('postId') postId: number): Promise<any> {
  //   const post = await this.adminService.findPostById(postId);
  //   if (!post) {
  //     throw new NotFoundException('게시물을 찾을 수 없습니다.');
  //   }
  //   return post;
  // }

  // 관리자 댓글 전체 조회
  @UseGuards(AdminGuard)
  @Get('comments')
  @HttpCode(HttpStatus.OK)
  async getAllComments(@Query('pageNumber') pageNumber: number, @Query('pageSize') pageSize: number = 10) {
    return await this.adminService.findAllCommentsAndReplies(pageNumber, pageSize);
  }

  // // 관리자 특정 댓글 삭제
  // @Delete('comments/:commentId')
  // @HttpCode(HttpStatus.OK)
  // async deleteComment(@Param('commentId') commentId: number): Promise<{ message: string }> {
  //   await this.adminService.deleteCommentOrReplyById(commentId);
  //   return { message: '댓글이 성공적으로 삭제되었습니다.' };
  // }
}
