import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { IUser } from 'src/auth/interfaces';
import { UpdateNicknameDto, UpdatePasswordDto } from './dto';
import { AuthPasswordService, AuthSignInService } from 'src/auth/services';
import { UsersDAO } from './users.dao';
import { CommentsDAO } from 'src/comments/comments.dao';
import { PostsDAO } from 'src/posts/posts.dao';
import { OcrService } from 'src/orc/ocr.service';
import { Request } from 'express';
import { ScrapsDAO } from 'src/scraps/scraps.dao';
import { RepliesDAO } from 'src/replies/replies.dao';
import { ICombinedResult } from './interfaces/combined-result.interface';
import { ECommentType } from './enums';
import { IPaginatedResponse } from 'src/common/interfaces';
import { IUserInfoResponse } from './interfaces';
import { PostsEntity } from 'src/posts/entities/base-posts.entity';
import { PostsService } from 'src/posts/posts.service';
import { EPostsBaseSortType } from 'src/common/enums';

@Injectable()
export class UsersService {
  constructor(
    private readonly authPasswordService: AuthPasswordService,
    private readonly usersDAO: UsersDAO,
    private readonly postsDAO: PostsDAO,
    private readonly scrapsDAO: ScrapsDAO,
    private readonly commentsDAO: CommentsDAO,
    private readonly repliesDAO: RepliesDAO,
    private readonly ocrService: OcrService,
    private readonly authSignInService: AuthSignInService,
    private readonly postsService: PostsService,
  ) {}

  // 나의 정보 조회
  async fetchMyInfo(sessionUser: IUser): Promise<IUserInfoResponse> {
    const { userId } = sessionUser;
    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) {
      throw new NotFoundException(`ID가 ${userId}인 회원이 존재하지 않습니다.`);
    }

    return { nickname: user.nickname, email: user.email, username: user.username, phoneNumber: user.phoneNumber };
  }

  // 나의 닉네임 수정
  async updateMyNickname(
    sessionUser: IUser,
    updateNicknameDto: UpdateNicknameDto,
    req: Request,
  ): Promise<{ message: string; newNickname: string }> {
    const { userId } = sessionUser;
    const { newNickname } = updateNicknameDto;

    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) {
      throw new NotFoundException(`ID가 ${userId}인 회원이 존재하지 않습니다.`);
    }

    // 닉네임 중복 여부 확인
    const nicknameExists = await this.usersDAO.checkNicknameExists(newNickname);
    if (nicknameExists) {
      throw new ConflictException('이미 사용 중인 닉네임입니다.');
    }

    // 닉네임 업데이트
    user.nickname = newNickname;
    await this.usersDAO.saveUser(user);

    return { message: '닉네임이 수정되었습니다.', newNickname };
  }

  // 나의 비밀번호 수정
  async updateMyPassword(userId: number, updatePasswordDto: UpdatePasswordDto): Promise<{ message: string }> {
    const { oldPassword, newPassword } = updatePasswordDto;
    const isTempPasswordSignIn = await this.authSignInService.checkTempPasswordSignIn(userId);

    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) {
      throw new NotFoundException(`ID가 ${userId}인 회원이 존재하지 않습니다.`);
    }

    const isOldPasswordValid = await this.authPasswordService.matchPassword(oldPassword, user.password);

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
  async fetchMyPosts(
    sessionUser: IUser,
    page: number,
    limit: number,
    sort: EPostsBaseSortType,
  ): Promise<IPaginatedResponse<PostsEntity>> {
    const { userId } = sessionUser;

    // 사용자 존재 확인
    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) {
      throw new NotFoundException(`ID가 ${userId}인 회원이 존재하지 않습니다.`);
    }

    // 본인 작성 게시물 조회
    const postsResponse = await this.postsDAO.findMyPosts(userId, page, limit, sort);

    // 각 게시물에 댓글 및 답글 수 추가
    const myPostsWithCounts = await Promise.all(
      postsResponse.items.map(async (post) => {
        const total = await this.postsService.getNumberOfCommentsAndReplies(post.postId);
        return {
          ...post,
          numberOfCommentsAndReplies: total,
        };
      }),
    );

    return {
      ...postsResponse,
      items: myPostsWithCounts,
    };
  }

  // 나의 댓글 및 답글 조회
  async fetchMyCommentsAndReplies(
    userId: number,
    page: number,
    limit: number,
    sort: EPostsBaseSortType,
  ): Promise<IPaginatedResponse<any>> {
    const skip = (page - 1) * limit;

    // 댓글과 답글 조회
    const [comments, commentsCount] = await this.commentsDAO.findCommentsByUserIdWithPagination(userId, 0, 0);
    const [replies, repliesCount] = await this.repliesDAO.findRepliesByUserIdWithPagination(userId, 0, 0);

    const postIds = [
      ...new Set(comments.map((comment) => comment.postId).concat(replies.map((reply) => reply.postId))),
    ];
    const posts = await this.postsDAO.findPostsByIds(postIds);

    const postMap = new Map(posts.map((post) => [post.postId, post]));

    const combinedResults: ICombinedResult[] = [];

    // 댓글 결과 조합
    await Promise.all(
      comments.map(async (comment) => {
        const post = postMap.get(comment.postId);
        const total = await this.postsService.getNumberOfCommentsAndReplies(comment.postId);

        combinedResults.push({
          type: ECommentType.COMMENT,
          commentId: comment.commentId,
          content: comment.content,
          createdAt: comment.createdAt,
          postId: comment.postId,
          boardType: post?.boardType,
          title: post?.title,
          numberOfCommentsAndReplies: total,
          postCreatedAt: post?.createdAt,
        });
      }),
    );

    // 답글 결과 조합
    await Promise.all(
      replies.map(async (reply) => {
        const post = postMap.get(reply.postId);
        const total = await this.postsService.getNumberOfCommentsAndReplies(reply.postId);

        combinedResults.push({
          type: ECommentType.REPLY,
          replyId: reply.replyId,
          commentId: reply.commentId,
          content: reply.content,
          createdAt: reply.createdAt,
          postId: reply.postId,
          boardType: post?.boardType || '정보없음',
          title: post?.title || '정보없음',
          numberOfCommentsAndReplies: total,
          postCreatedAt: post?.createdAt,
        });
      }),
    );

    // 정렬 기준
    switch (sort) {
      case 'oldest':
        // 작성순 (댓글/답글 기준)
        combinedResults.sort((a, b) => {
          return (new Date(a?.createdAt).getTime() || 0) - (new Date(b?.createdAt).getTime() || 0);
        });
        break;

      default:
        // 최신순 (댓글/답글 기준)
        combinedResults.sort((a, b) => {
          return (new Date(b?.createdAt).getTime() || 0) - (new Date(a?.createdAt).getTime() || 0);
        });
        break;
    }

    // 전체 결과에 대해 페이지네이션 적용
    const paginatedResults = combinedResults.slice(skip, skip + limit);

    return {
      items: paginatedResults,
      totalItems: commentsCount + repliesCount,
      totalPages: Math.ceil((commentsCount + repliesCount) / limit),
      currentPage: page,
    };
  }

  // 나의 스크랩한 게시물 조회
  async fetchMyScrapedPosts(
    sessionUser: IUser,
    page: number,
    limit: number,
    sort: EPostsBaseSortType,
  ): Promise<IPaginatedResponse<any>> {
    const { userId } = sessionUser;
    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) {
      throw new NotFoundException(`ID가 ${userId}인 회원이 존재하지 않습니다.`);
    }

    const scrapedPosts = await this.scrapsDAO.findMyScraps(userId, page, limit, sort);

    // 원 게시물 조회
    const posts = await Promise.all(
      scrapedPosts.items.map((scrap) => this.postsDAO.findPostEntityByPostId(scrap.postId)),
    );

    // 정렬 기준
    switch (sort) {
      case 'oldest':
        // 작성순 (원 게시물 기준)
        posts.sort((a, b) => {
          return (new Date(a.createdAt).getTime() || 0) - (new Date(b.createdAt).getTime() || 0);
        });
        break;

      default:
        // 최신순 (원 게시물 기준)
        posts.sort((a, b) => {
          return (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0);
        });
        break;
    }

    const formattedPosts = await Promise.all(
      posts.map(async (post) => {
        const totalCommentsAndReplies = await this.postsService.getNumberOfCommentsAndReplies(post.postId);
        const correspondingScrap = scrapedPosts.items.find((scrap) => scrap.postId === post.postId);

        return {
          scrapId: correspondingScrap.scrapId, // 스크랩 ID
          postId: post.postId, // 게시물 ID
          boardType: post.boardType, // 게시판 카테고리
          title: post.title, // 제목
          viewCounts: post.viewCounts, // 조회수
          likeCounts: post.likeCounts, // 좋아요수
          createdAt: post.createdAt, // 작성일
          numberOfCommentsAndReplies: totalCommentsAndReplies, // 댓글 및 답글 수
        };
      }),
    );

    return {
      items: formattedPosts,
      totalItems: scrapedPosts.totalItems,
      totalPages: scrapedPosts.totalPages,
      currentPage: scrapedPosts.currentPage,
    };
  }

  // 회원의 인증서 이미지 URL 정보를 업데이트
  async updateUserCertificationUrl(userId: number, imageUrl: string) {
    const updateduser = await this.usersDAO.findUserByUserId(userId);
    if (!updateduser) throw new NotFoundException('해당 회원이 존재하지 않습니다.');

    updateduser.certificationDocumentUrl = imageUrl;
    await this.usersDAO.saveUser(updateduser);
    if (updateduser.certificationDocumentUrl !== imageUrl) {
      throw new BadRequestException('인증서 URL 업데이트에 실패했습니다.');
    }

    return updateduser.certificationDocumentUrl;
  }

  // 회원 인증서류 URL에서 실명 추출
  async extractUserName(userId: number): Promise<string> {
    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) {
      throw new NotFoundException(`ID가 ${userId}인 회원이 존재하지 않습니다.`);
    }

    const certificationUrl = user.certificationDocumentUrl;
    if (!certificationUrl) throw new NotFoundException('해당 회원의 인증서류 URL을 찾을 수 없습니다.');

    const extractedUserName = await this.ocrService.detextTextFromImage(certificationUrl);

    user.username = extractedUserName;
    await this.usersDAO.saveUser(user);

    return extractedUserName;
  }

  // 회원가입시 닉네임 중복여부 확인
  async isNicknameAvailable(nickname: string): Promise<boolean> {
    const user = await this.usersDAO.checkNicknameExists(nickname);
    return !user;
  }

  // 회원가입시 이메일 중복여부 확인
  async isEmailAvailable(email: string): Promise<boolean> {
    const user = await this.usersDAO.findUserByEmail(email);
    return !user;
  }
}
