import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IUserWithoutPassword } from 'src/auth/interfaces';
import { IUserInfoResponse } from './interfaces/user-info-response.interface';
import { UpdateNicknameDto, UpdatePasswordDto } from './dto';
import { AuthPasswordService } from 'src/auth/services';
import { UsersDAO } from './users.dao';
import { CommentsDAO } from 'src/comments/comments.dao';
import { PostsDAO } from 'src/posts/posts.dao';
import { OcrService } from 'src/orc/ocr.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly authPasswordService: AuthPasswordService,
    private readonly userDAO: UsersDAO,
    private readonly postsDAO: PostsDAO,
    private readonly commentsDAO: CommentsDAO,
    private readonly ocrService: OcrService,
  ) {}

  // 나의 정보 조회
  async fetchMyInfo(sessionUser: IUserWithoutPassword): Promise<IUserInfoResponse> {
    const { nickname, email, username, phoneNumber } = sessionUser;
    return { nickname, email, username, phoneNumber };
  }

  // 나의 닉네임 수정
  async updateMyNickname(sessionUser: IUserWithoutPassword, updateNicknameDto: UpdateNicknameDto) {
    const { userId } = sessionUser;
    const { newNickname } = updateNicknameDto;

    const user = await this.userDAO.findUserByUserId(userId);

    if (!user) {
      throw new NotFoundException('해당 회원이 존재하지 않습니다.');
    }

    user.nickname = newNickname;
    await this.userDAO.saveUser(user);
    return { message: '닉네임이 수정되었습니다.' };
  }

  // 나의 비밀번호 수정
  async updateMyPassword(sessionUser: IUserWithoutPassword, updatePasswordDto: UpdatePasswordDto) {
    const { userId } = sessionUser;
    const { oldPassword, newPassword } = updatePasswordDto;

    const user = await this.userDAO.findUserByUserId(userId);

    if (!user) {
      throw new NotFoundException('해당 회원이 존재하지 않습니다.');
    }

    const isOldPasswordValid = this.authPasswordService.matchPassword(oldPassword, user.password);

    if (!isOldPasswordValid) {
      throw new BadRequestException('현재 비밀번호가 저장된 비밀번호와 일치하지 않습니다.');
    }

    if (oldPassword === newPassword) {
      throw new BadRequestException('현재 비밀번호와 새 비밀번호는 서로 달라야 합니다.');
    }

    const newHashedPassword = await this.authPasswordService.createPassword(newPassword);
    user.password = newHashedPassword;
    await this.userDAO.saveUser(user);

    return { message: '비밀번호가 수정되었습니다.' };
  }

  // 나의 게시글 조회
  async fetchMyPosts(sessionUser: IUserWithoutPassword, page: number, limit: number, sort: 'latest' | 'popular') {
    if (!sessionUser?.userId) {
      throw new BadRequestException('회원 ID가 존재하지 않습니다.');
    }
    return this.postsDAO.findMyPosts(sessionUser.userId, page, limit, sort);
  }

  // 나의 댓글 조회
  async fetchMyComments(sessionUser: IUserWithoutPassword, page: number, limit: number, sort: 'latest' | 'popular') {
    if (!sessionUser?.userId) {
      throw new BadRequestException('회원 ID가 존재하지 않습니다.');
    }
    return this.commentsDAO.findMyComments(sessionUser.userId, page, limit, sort);
  }

  // 회원 인증서류 URL에서 실명 추출
  async extractUserName(userId: number) {
    const user = await this.userDAO.findUserByUserId(userId);
    if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

    const certificationUrl = user.certificationDocumentUrl;
    if (!certificationUrl) throw new NotFoundException('해당 회원의 인증서류 URL을 찾을 수 없습니다.');

    const extractedUserName = await this.ocrService.detextTextFromImage(certificationUrl);

    return extractedUserName;
  }
}
