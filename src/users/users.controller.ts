import { Controller, Get, Patch, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { SessionUser } from 'src/auth/decorators/get-user.decorator';
import { IUserWithoutPassword } from 'src/auth/interfaces';
import { UpdateNicknameDto, UpdatePasswordDto } from './dto';

@Controller('me')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // 본인 정보 조회
    @Get()
    async getMyInfo(@SessionUser() user: IUserWithoutPassword){
        return this.usersService.fetchMyInfo(user);
    }

    // 본인 닉네임 수정
    @Patch('nickname')
    async patchMyInfo(@SessionUser() user: IUserWithoutPassword, @Body() updateNicknameDto: UpdateNicknameDto){
        return this.usersService.updateMyNickname(user, updateNicknameDto);
    }

    // 본인 비밀번호 수정
    @Patch('password')
    async patchMyPassword(@SessionUser() user: IUserWithoutPassword, @Body() updatePasswordDto: UpdatePasswordDto){
        return this.usersService.updateMyPassword(user, updatePasswordDto);
    }

    // 본인 게시글 전체 조회
    @Get('/posts')
    async getMyPosts(@SessionUser() user: IUserWithoutPassword){
        return this.usersService.fetchMyPosts(user);
    }

    // 본인 댓글 전체 조회
    @Get('/comments')
    async getMyComments(@SessionUser() user: IUserWithoutPassword){
        return this.usersService.fetchMyComments(user);
    }
}
