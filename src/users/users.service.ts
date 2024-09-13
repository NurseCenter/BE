import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IUserWithoutPassword } from 'src/auth/interfaces';
import { IUserInfoResponse } from './interfaces/user-info-response.interface';
import { UpdateNicknameDto, UpdatePasswordDto } from './dto';
import { AuthPasswordService, AuthSessionService, AuthSignInService } from 'src/auth/services';
import { UsersDAO } from './users.dao';
import { CommentsDAO } from 'src/comments/comments.dao';
import { PostsDAO } from 'src/posts/posts.dao';
import { OcrService } from 'src/orc/ocr.service';
import { Request } from 'express';

@Injectable()
export class UsersService {
  constructor(
    private readonly authPasswordService: AuthPasswordService,
    private readonly usersDAO: UsersDAO,
    private readonly postsDAO: PostsDAO,
    private readonly commentsDAO: CommentsDAO,
    private readonly ocrService: OcrService,
    private readonly authSessionService: AuthSessionService,
    private readonly authSignInService: AuthSignInService,
  ) {}

  // 나의 정보 조회
  async fetchMyInfo(sessionUser: IUserWithoutPassword): Promise<IUserInfoResponse> {
    const { nickname, email, username, phoneNumber } = sessionUser;
    return { nickname, email, username, phoneNumber };
  }

  // 나의 닉네임 수정
  async updateMyNickname(sessionUser: IUserWithoutPassword, updateNicknameDto: UpdateNicknameDto, req: Request) {
    const { userId } = sessionUser;
    const { newNickname } = updateNicknameDto;

    const user = await this.usersDAO.findUserByUserId(userId);

    if (!user) {
      throw new NotFoundException('해당 회원이 존재하지 않습니다.');
    }

    // 닉네임 업데이트
    user.nickname = newNickname;
    const updatedUser = await this.usersDAO.saveUser(user);

    // 세션 정보 업데이트
    await this.authSessionService.updateSessionInfo(req, userId, updatedUser);
    return { message: '닉네임이 수정되었습니다.' };
  }

  // 나의 비밀번호 수정
  async updateMyPassword(sessionUser: IUserWithoutPassword, updatePasswordDto: UpdatePasswordDto) {
    const { userId } = sessionUser;
    const { oldPassword, newPassword } = updatePasswordDto;
    const isTempPasswordSignIn = await this.authSignInService.checkTempPasswordSignIn(userId);

    const user = await this.usersDAO.findUserByUserId(userId);

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

    const newHashedPassword = await this.authPasswordService.createHashedPassword(newPassword);
    user.password = newHashedPassword;

    if (isTempPasswordSignIn) {
      user.tempPasswordIssuedDate = null;
    }

    await this.usersDAO.saveUser(user);

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
    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

    const certificationUrl = user.certificationDocumentUrl;
    if (!certificationUrl) throw new NotFoundException('해당 회원의 인증서류 URL을 찾을 수 없습니다.');

    const extractedUserName = await this.ocrService.detextTextFromImage(certificationUrl);

    user.username = extractedUserName;
    await this.usersDAO.saveUser(user);

    return extractedUserName;
  }

  async isNicknameAvailable(nickname: string): Promise<boolean> {
    const user = await this.usersDAO.findUserByNickname(nickname);
    return !user;
  }

  async isEmailAvailable(email: string): Promise<boolean> {
    const user = await this.usersDAO.findUserByEmail(email);
    return !user;
  }
}
