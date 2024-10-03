import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { EBoardType } from './enum/board-type.enum';
import { PostsEntity } from './entities/base-posts.entity';
import { IUserWithoutPassword } from '../auth/interfaces/session-decorator.interface';
import { BasePostDto } from './dto/base-post.dto';
import { EReportReason, EReportStatus } from 'src/reports/enum';
import { GetPostsQueryDto } from './dto/get-posts-query.dto';
import { IPaginatedResponse } from 'src/common/interfaces';
import { PostsDAO } from './posts.dao';
import { ScrapsDAO } from 'src/scraps/scraps.dao';
import { LikesDAO } from 'src/likes/likes.dao';
import { FileUploader } from '../files/file-uploader';
import { ReportedPostsDAO } from 'src/reports/dao';
import { ReportDto } from './dto/report.dto';
import { ReportedPostDto } from 'src/reports/dto/reported-post.dto';
import { PostsMetricsDAO } from './metrics/posts-metrics-dao';
import { IPostDetailResponse, IPostResponse } from './interfaces';
import { IReportedPostResponse } from 'src/reports/interfaces/users';
import { UsersDAO } from 'src/users/users.dao';
import { CommentsDAO } from 'src/comments/comments.dao';
import { RepliesDAO } from 'src/replies/replies.dao';
import { summarizeContent } from 'src/common/utils/summarize.utils';
import { throwIfUserNotExists } from 'src/common/error-handlers/user-error-handlers';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsDAO: PostsDAO,
    private readonly postsMetricsDAO: PostsMetricsDAO,
    private readonly scrapsDAO: ScrapsDAO,
    private readonly fileUploader: FileUploader,
    private readonly reportedPostsDAO: ReportedPostsDAO,
    private readonly likesDAO: LikesDAO,
    private readonly usersDAO: UsersDAO,
    private readonly commentsDAO: CommentsDAO,
    private readonly repliesDAO: RepliesDAO,
  ) {}

  // 모든 게시글 조회
  async getAllPosts(
    boardType: EBoardType,
    getPostsQueryDto: GetPostsQueryDto,
  ): Promise<IPaginatedResponse<PostsEntity>> {
    const { posts, total } = await this.postsDAO.findPosts(boardType, getPostsQueryDto);
    const { limit, page } = getPostsQueryDto;

    // 각 게시물에 댓글 및 답글 수 추가
    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const total = await this.getNumberOfCommentsAndReplies(post.postId);

        return {
          ...post,
          numberOfCommentsAndReplies: total,
        };
      }),
    );

    return {
      items: postsWithCounts,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // 게시물 생성
  async createPost(
    boardType: EBoardType,
    createPostDto: CreatePostDto,
    sessionUser: IUserWithoutPassword,
  ): Promise<IPostResponse> {
    const { title, content, imageTypes, hospitalNames } = createPostDto;
    const { userId } = sessionUser;

    const user = await this.usersDAO.findUserByUserId(userId);
    throwIfUserNotExists(user, userId);

    if (boardType === EBoardType.NOTICE && !user.isAdmin) {
      throw new ForbiddenException(
        '공지사항은 서비스 이용에 필요한 중요한 정보를 제공하기 위해 관리자만 직접 작성할 수 있습니다.',
      );
    }

    const createdPost = await this.postsDAO.createPost(title, content, userId, hospitalNames, boardType);
    await this.postsDAO.savePost(createdPost);

    const fileEntities = await this.fileUploader.handleFiles(imageTypes, createdPost);
    createdPost.files = fileEntities;

    const summaryContent = summarizeContent(content);

    return {
      postId: createdPost.postId, // 게시물 ID
      userId: createdPost.userId, // 작성자 ID
      title: createdPost.title, // 게시물 제목
      content: summaryContent, // 내용 (요약본)
      hospitalNames: createdPost.hospitalNames, // 게시물과 관련된 병원 이름 (배열)
      createdAt: createdPost.createdAt, // 작성일
      presignedPostData: fileEntities.map((file) => file.url), // presigned URL
    };
  }

  // 특정 게시글 조회
  async getOnePost(
    boardType: EBoardType,
    postId: number,
    sessionUser: IUserWithoutPassword,
  ): Promise<IPostDetailResponse> {
    const { userId } = sessionUser;
    const post = await this.postsDAO.findOnePostByPostId(postId);
    const existsInBoardType = await this.postsDAO.findPostByIdAndBoardType(postId, boardType);
    const numberOfCommentsAndReplies = await this.getNumberOfCommentsAndReplies(postId);

    if (!post || !existsInBoardType) {
      throw new NotFoundException(`${boardType} 게시판에서 ${postId}번 게시물을 찾을 수 없습니다.`);
    }

    await this.postsMetricsDAO.increaseViewCount(postId);

    const isLiked = await this.likesDAO.checkIfLiked(userId, postId);
    const isScraped = await this.scrapsDAO.checkIfScraped(userId, postId);

    return {
      postId: post.postId, // 게시물 ID
      category: post.boardType, // 게시판 카테고리
      title: post.title, // 게시물 제목
      content: post.content, // 게시물 내용
      hospitalNames: post.hospitalNames, // 병원 이름
      likeCounts: post.likeCounts, // 좋아요수
      viewCounts: post.viewCounts, // 조회수
      createdAt: post.createdAt, // 작성일
      updatedAt: post.updatedAt, // 수정일 (업데이트 유무 렌더링)
      isLiked, // 좋아요 여부
      isScraped, // 스크랩 여부
      user: post.user, // 작성자 정보
      numberOfComments: numberOfCommentsAndReplies, // 댓글과 답글 수
    };
  }

  // 게시글 수정
  async updatePost(
    boardType: EBoardType,
    postId: number,
    updatePostDto: UpdatePostDto,
    sessionUser: IUserWithoutPassword,
  ): Promise<IPostResponse> {
    const { userId } = sessionUser;
    const post = await this.postsDAO.findOnePostByPostId(postId);
    const existsInBoardType = await this.postsDAO.findPostByIdAndBoardType(postId, boardType);

    if (!post || !existsInBoardType)
      throw new NotFoundException(`${boardType} 게시판에서 ${postId}번 게시물을 찾을 수 없습니다.`);

    if (post.user.userId !== userId) {
      throw new ForbiddenException('이 게시물을 수정할 권한이 없습니다.');
    }

    const { title, content, imageTypes } = updatePostDto;
    let contentChanged = false; // 변경 플래그

    if (title !== null && title !== undefined) {
      post.title = title;
      contentChanged = true; // 제목이 변경된 경우
    }

    if (content !== null && content !== undefined) {
      post.content = content;
      contentChanged = true; // 내용이 변경된 경우
    }

    // 파일 업로드 처리 
    // 추후에 불필요하면 삭제할 예정
    const fileEntities = await this.fileUploader.handleFiles(imageTypes, post);
    post.files = fileEntities;

    // 내용이 변경된 경우에만 updatedAt에 현재 날짜 넣어주기
    if (contentChanged) {
      post.updatedAt = new Date(); 
    }

    const updatedPost = await this.postsDAO.savePost(post);

    const summaryContent = summarizeContent(updatedPost.content);

    return {
      postId: updatedPost.postId, // 게시물 ID
      userId: updatedPost.user.userId, // 작성자 ID
      title: updatedPost.title, // 게시물 제목
      content: summaryContent, // 내용 (요약본)
      hospitalNames: updatedPost.hospitalNames, // 병원 이름
      createdAt: updatedPost.createdAt, // 작성일
      updatedAt: updatedPost.updatedAt, // 수정일
      presignedPostData: fileEntities.map((file) => file.url), // presignedURL
    };
  }

  // 게시글 삭제
  async deletePost(
    boardType: EBoardType,
    postId: number,
    sessionUser: IUserWithoutPassword,
  ): Promise<{ message: string }> {
    try {
      const { userId } = sessionUser;
      const post = await this.postsDAO.findOnePostByPostId(postId);
      const existsInBoardType = await this.postsDAO.findPostByIdAndBoardType(postId, boardType);

      if (!post || !existsInBoardType)
        throw new NotFoundException(`${boardType} 게시판에서 ${postId}번 게시물을 찾을 수 없습니다.`);

      if (post.user.userId !== userId) {
        throw new ForbiddenException('이 게시물을 삭제할 권한이 없습니다.');
      }

      if (post.deletedAt !== null) {
        throw new ConflictException('이미 삭제된 게시물입니다.');
      }

      const result = await this.postsDAO.deletePost(postId);
      if (result.affected === 0) {
        throw new NotFoundException(`게시물 삭제 중 에러가 발생하였습니다.`);
      }

      return { message: '게시물이 삭제되었습니다.' };
    } catch (err) {
      throw err;
    }
  }

  // 특정 게시글 신고
  async reportPost(
    basePostDto: BasePostDto,
    sessionUser: IUserWithoutPassword,
    reportDto: ReportDto,
  ): Promise<IReportedPostResponse> {
    const { userId } = sessionUser;
    const { boardType, postId } = basePostDto;

    const post = await this.postsDAO.findOnePostByPostId(postId);
    const existsInBoardType = await this.postsDAO.findPostByIdAndBoardType(postId, boardType);

    if (!post || !existsInBoardType)
      throw new NotFoundException(`${boardType} 게시판에서 ${postId}번 게시물을 찾을 수 없습니다.`);

    if (post.user.userId === userId) {
      throw new ForbiddenException(`본인의 게시물은 본인이 신고할 수 없습니다.`);
    }

    if (reportDto.reportedReason === EReportReason.OTHER) {
      if (!reportDto.otherReportedReason) {
        throw new BadRequestException(`신고 사유가 '기타'일 경우, 기타 신고 사유를 기입해주세요.`);
      }
    } else {
      if (reportDto.otherReportedReason) {
        throw new BadRequestException(`신고 사유가 '기타'가 아닐 경우, 기타 신고 사유는 입력할 수 없습니다.`);
      }
    }

    const existingReport = await this.reportedPostsDAO.existsReportedPost(postId, userId);
    if (existingReport) {
      throw new ConflictException(`이미 신고한 게시물입니다.`);
    }

    const reportedPostDto: ReportedPostDto = {
      postId, // 신고된 게시물 ID
      userId, // 신고한 회원 ID
      reportedUserId: post.user.userId, // 신고된 게시글의 작성자 ID
      reportedReason: reportDto.reportedReason, // 신고 이유
      otherReportedReason: reportDto.otherReportedReason, // 기타 신고 이유
      status: EReportStatus.PENDING, // 신고 처리 상태
    };

    const result = await this.reportedPostsDAO.createPostReport(reportedPostDto);
    await this.reportedPostsDAO.saveReportPost(result);

    post.reportedAt = new Date();
    await this.postsDAO.savePost(post);

    return {
      reportPostId: result.reportPostId, // 신고 ID
      postId: result.postId, // 게시글 ID
      userId: result.userId, // 신고한 사용자 ID
      reportedReason: result.reportedReason, // 신고 이유
      otherReportedReason: result.otherReportedReason, // 기타 신고 이유
      reportedUserId: result.reportedUserId, // 신고된 사용자 ID
      createdAt: result.createdAt, // 신고 일자
    };
  }

  // 게시판 카테고리별 게시물 수 조회
  async getPostsCountByCategory(boardType?: EBoardType): Promise<{ boardType: EBoardType; count: number }[]> {
    return this.postsDAO.countPostsByCategory(boardType);
  }

  // 한 게시물에 달린 댓글과 답글 수 구하기
  async getNumberOfCommentsAndReplies(postId: number): Promise<number> {
    const numberOfComments = (await this.commentsDAO.countAllCommentsByPostId(postId)) || 0;
    const numberOfReplies = (await this.repliesDAO.countAllrepliesByPostId(postId)) || 0;

    const total = numberOfComments + numberOfReplies;
    return total;
  }
}
