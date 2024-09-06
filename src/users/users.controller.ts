import { Controller, Get, Patch, Body, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { SessionUser } from 'src/auth/decorators/get-user.decorator';
import { IUserWithoutPassword } from 'src/auth/interfaces';
import { GetMyCommentsQueryDto, GetMyPostsQueryDto, UpdateNicknameDto, UpdatePasswordDto } from './dto';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 본인 정보 조회
  @ApiOperation({ summary: '본인 정보 조회' })
  @ApiResponse({ status: 200, description: '본인의 정보가 성공적으로 조회되었습니다.' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @Get()
  async getMyInfo(@SessionUser() user: IUserWithoutPassword) {
    return this.usersService.fetchMyInfo(user);
  }

  // 본인 닉네임 수정
  @ApiOperation({ summary: '본인 닉네임 수정' })
  @ApiBody({ type: UpdateNicknameDto, description: '수정할 닉네임 정보' })
  @ApiResponse({ status: 200, description: '닉네임이 성공적으로 수정되었습니다.' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @Patch('nickname')
  async patchMyInfo(@SessionUser() user: IUserWithoutPassword, @Body() updateNicknameDto: UpdateNicknameDto) {
    return this.usersService.updateMyNickname(user, updateNicknameDto);
  }

  // 본인 비밀번호 수정
  @ApiOperation({ summary: '본인 비밀번호 수정' })
  @ApiBody({ type: UpdatePasswordDto, description: '수정할 비밀번호 정보' })
  @ApiResponse({ status: 200, description: '비밀번호가 성공적으로 수정되었습니다.' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @Patch('password')
  async patchMyPassword(@SessionUser() user: IUserWithoutPassword, @Body() updatePasswordDto: UpdatePasswordDto) {
    return this.usersService.updateMyPassword(user, updatePasswordDto);
  }

  // 본인 게시글 전체 조회
  @ApiOperation({ summary: '본인 게시글 전체 조회' })
  @ApiQuery({ name: 'page', type: Number, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', type: Number, description: '페이지당 게시글 수', required: false })
  @ApiQuery({ name: 'sort', type: String, enum: ['latest', 'popular'], description: '정렬 기준', required: false })
  @ApiResponse({ status: 200, description: '본인의 게시글이 성공적으로 조회되었습니다.' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @Get('posts')
  async getMyPosts(@SessionUser() user: IUserWithoutPassword, @Query() query: GetMyPostsQueryDto) {
    return this.usersService.fetchMyPosts(user, query.page, query.limit, query.sort);
  }

  // 본인 댓글 전체 조회
  @ApiOperation({ summary: '본인 댓글 전체 조회' })
  @ApiQuery({ name: 'page', type: Number, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', type: Number, description: '페이지당 댓글 수', required: false })
  @ApiQuery({ name: 'sort', type: String, enum: ['latest', 'popular'], description: '정렬 기준', required: false })
  @ApiResponse({ status: 200, description: '본인의 댓글이 성공적으로 조회되었습니다.' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @Get('comments')
  async getMyComments(@SessionUser() user: IUserWithoutPassword, @Query() query: GetMyCommentsQueryDto) {
    return this.usersService.fetchMyComments(user, query.page, query.limit, query.sort);
  }
}
