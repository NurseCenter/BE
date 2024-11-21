import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { EBoardType } from './enum/board-type.enum';
import { PostsEntity } from './entities/base-posts.entity';
import { BasePostDto } from './dto/base-post.dto';
import { EReportReason, EReportStatus } from 'src/reports/enum';
import { GetPostsQueryDto } from './dto/get-posts-query.dto';
import { IPaginatedResponse } from 'src/common/interfaces';
import { PostsDAO } from './posts.dao';
import { ScrapsDAO } from 'src/scraps/scraps.dao';
import { LikesDAO } from 'src/likes/likes.dao';
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
import { IUser } from 'src/auth/interfaces';
import { FilesService } from 'src/files/files.service';
import { FilesDAO } from 'src/files/dao/files.dao';
import { ImagesDAO } from 'src/files/dao/images.dao';
import { IFileUrls } from 'src/files/interfaces/file-urls.interface';
import { winstonLogger } from 'src/config/logger.config';
import { processContent } from 'src/common/utils/text-utils';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsDAO: PostsDAO,
    private readonly postsMetricsDAO: PostsMetricsDAO,
    private readonly scrapsDAO: ScrapsDAO,
    private readonly reportedPostsDAO: ReportedPostsDAO,
    private readonly likesDAO: LikesDAO,
    private readonly usersDAO: UsersDAO,
    private readonly commentsDAO: CommentsDAO,
    private readonly repliesDAO: RepliesDAO,
    private readonly filesService: FilesService,
    private readonly filesDAO: FilesDAO,
    private readonly imagesDAO: ImagesDAO,
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
  async createPost(boardType: EBoardType, createPostDto: CreatePostDto, sessionUser: IUser): Promise<IPostResponse> {
    const { title, content, fileUrls, hospitalNames } = createPostDto;
    const { userId } = sessionUser;

    const processedContent = processContent(content);

    const user = await this.usersDAO.findUserByUserId(userId);
    if (!user) {
      throw new NotFoundException(`ID가 ${userId}인 회원이 존재하지 않습니다.`);
    }

    if (boardType === EBoardType.NOTICE && !user.isAdmin) {
      throw new ForbiddenException(
        '공지사항은 서비스 이용에 필요한 중요한 정보를 제공하기 위해 관리자만 직접 작성할 수 있습니다.',
      );
    }

    const createdPost = await this.postsDAO.createPost(title, processedContent, userId, hospitalNames, boardType);
    await this.postsDAO.savePost(createdPost);

    if (fileUrls) {
      const { images, attachments } = fileUrls as IFileUrls;
      if (Array.isArray(attachments) && Array.isArray(images)) {
        await this.filesService.uploadFiles(attachments, createdPost.postId);
        await this.filesService.uploadImages(images, createdPost.postId);
      } else {
        throw new BadRequestException('attachments와 images는 배열이어야 합니다.');
      }
    }

    const summaryContent = summarizeContent(processedContent);

    // fileUrls가 있으면 개수 세기, 없으면 "첨부파일 없음" 표시
    const fileCount = fileUrls
      ? `본문 이미지 파일 ${fileUrls?.images?.length || 0}개, 첨부파일 ${fileUrls?.attachments?.length || 0}개`
      : '첨부파일 없음';

    return {
      postId: createdPost.postId, // 게시물 ID
      category: createdPost.boardType, // 카테고리
      userId: createdPost.userId, // 작성자 ID
      title: createdPost.title, // 게시물 제목
      content: summaryContent, // 내용 (요약본)
      hospitalNames: createdPost.hospitalNames, // 게시물과 관련된 병원 이름 (배열)
      createdAt: createdPost.createdAt, // 작성일
      fileUrls: fileCount, // 첨부파일 개수
    };
  }

  // 특정 게시글 조회
  async getOnePost(boardType: EBoardType, postId: number, sessionUser: IUser): Promise<IPostDetailResponse> {
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

    const filesArray = await this.filesDAO.getFileUrlsInOnePost(postId);
    const imagesArray = await this.imagesDAO.getImageUrlsInOnePost(postId);

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
      fileUrls: { images: imagesArray, attachments: filesArray }, // 게시글에 첨부된 파일 URL들
    };
  }

  // 게시글 수정
  async updatePost(
    postId: number,
    boardType: EBoardType,
    updatePostDto: UpdatePostDto,
    sessionUser: IUser,
  ): Promise<IPostResponse | { message: string }> {
    const { userId } = sessionUser;
    const { title, content, afterBoardType, fileUrls } = updatePostDto;

    const processedContent = processContent(content);

    const post = await this.postsDAO.findOnePostByPostId(postId);
    const existsInBoardType = await this.postsDAO.findPostByIdAndBoardType(postId, boardType);

    if (!post || !existsInBoardType)
      throw new NotFoundException(`${boardType} 게시판에서 ${postId}번 게시물을 찾을 수 없습니다.`);

    if (post.user.userId !== userId) {
      throw new ForbiddenException('이 게시물을 수정할 권한이 없습니다.');
    }

    // 변경 플래그
    let contentChanged = false;
    let boardTypeChanged = false;
    let filesChanged = false;

    // 제목 변경
    if (title !== null && title !== undefined && post.title !== title) {
      post.title = title;
      contentChanged = true;
    }

    // 본문 내용 변경
    if (content !== null && content !== undefined && post.content !== processedContent) {
      post.content = processedContent;
      contentChanged = true;
    }

    // 카테고리 변경
    if (afterBoardType !== null && afterBoardType !== undefined && post.boardType !== afterBoardType) {
      post.boardType = afterBoardType;
      boardTypeChanged = true;
    }

    // 파일 처리
    if (fileUrls) {
      const { images, attachments } = fileUrls as IFileUrls;
      if (Array.isArray(attachments) && Array.isArray(images)) {
        // 기존 파일과 비교하여 추가한 파일 테이블에 추가, 없는 건 삭제
        const existingFiles = await this.filesDAO.getFileUrlsInOnePost(postId);
        const existingImages = await this.imagesDAO.getImageUrlsInOnePost(postId);

        // 1. 새로운 첨부파일 추가
        const newAttachements = attachments.filter(
          (attachment) => !existingFiles.some((file) => file.fileUrl === attachment.fileUrl),
        );
        if (newAttachements.length > 0) {
          await this.filesService.uploadFiles(newAttachements, postId);
          filesChanged = true;
        }

        // 2. 새로운 이미지 파일 추가
        const newImages = images.filter((image) => !existingImages.some((existingImage) => existingImage === image));
        if (newImages.length > 0) {
          await this.filesService.uploadImages(newImages, postId);
          filesChanged = true;
        }

        // 3. 기존 파일 중 삭제된 파일 처리
        const deletedAttachments = existingFiles.filter(
          (file) => !attachments.some((attachment) => attachment.fileUrl === file.fileUrl),
        );
        const deletedImages = existingImages.filter((image) => !images.some((img) => img === image));

        // 첨부파일 삭제 처리
        if (deletedAttachments.length > 0) {
          await this.filesDAO.deleteFiles(deletedAttachments.map((file) => file.fileUrl));
          filesChanged = true;
        }

        // 이미지 삭제 처리
        if (deletedImages.length > 0) {
          await this.imagesDAO.deleteImages(deletedImages);
          filesChanged = true;
        }
      } else {
        throw new BadRequestException('attachments와 images는 배열이어야 합니다.');
      }
    } else {
      filesChanged = false;
    }

    // 아무 것도 수정되지 않은 경우
    if (!contentChanged && !boardTypeChanged && !filesChanged) {
      return { message: '수정된 내용이 없습니다.', postId };
    }

    // 변경된 경우에만 updatedAt에 현재 날짜 넣어주기
    if (contentChanged || boardTypeChanged || filesChanged) {
      post.updatedAt = new Date();
    }

    const updatedPost = await this.postsDAO.savePost(post);
    const summaryContent = summarizeContent(updatedPost.content);

    // fileUrls가 있으면 개수 세기, 없으면 "첨부파일 없음" 표시
    const fileCount = fileUrls
      ? `본문 이미지 파일 ${fileUrls?.images?.length || 0}개, 첨부파일 ${fileUrls?.attachments?.length || 0}개`
      : '첨부파일 없음';

    return {
      postId: updatedPost.postId, // 게시물 ID
      category: updatedPost.boardType, // 게시물 카테고리
      userId: updatedPost.user.userId, // 작성자 ID
      title: updatedPost.title, // 게시물 제목
      content: summaryContent, // 내용 (요약본)
      hospitalNames: updatedPost.hospitalNames, // 병원 이름
      createdAt: updatedPost.createdAt, // 작성일
      updatedAt: updatedPost.updatedAt, // 수정일
      fileUrls: fileCount, // 첨부파일 개수
    };
  }

  // 게시글 삭제
  async deletePost(
    boardType: EBoardType,
    postId: number,
    sessionUser: IUser,
  ): Promise<{ message: string; postId: number }> {
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

      // 첨부파일 URL 조회
      const fileUrls = await this.filesDAO.getFileUrlsInOnePost(postId);
      const allFileUrls = fileUrls.map((file) => file.fileUrl);

      // 본문 이미지 파일 조회
      const allImageUrls = await this.imagesDAO.getImageUrlsInOnePost(postId);

      const failedDeletions: string[] = [];

      // 첨부파일 삭제
      try {
        await this.filesDAO.deleteFiles(allFileUrls);
      } catch (err) {
        winstonLogger.error('삭제 실패한 첨부파일 URL: ', allFileUrls, err);
      }

      // 이미지 삭제
      try {
        await this.imagesDAO.deleteImages(allImageUrls);
      } catch (err) {
        winstonLogger.error('삭제 실패한 이미지파일 URL: ', allImageUrls, err);
        failedDeletions.push(...allImageUrls);
      }

      // 게시물 삭제
      const result = await this.postsDAO.deletePost(postId);
      if (result.affected === 0) {
        throw new InternalServerErrorException(`게시물 삭제 중 에러가 발생하였습니다.`);
      }

      // 실패한 삭제가 있는 경우 메시지 생성
      let deletionErrorMessage = '';
      if (failedDeletions.length > 0) {
        deletionErrorMessage = `다음 URL(s)은 삭제되지 않았습니다: ${failedDeletions.join(', ')}`;
      }

      return {
        message: '게시물이 삭제되었습니다.',
        postId,
        ...(deletionErrorMessage && { errors: deletionErrorMessage }),
      };
    } catch (err) {
      throw err;
    }
  }

  // 특정 게시글 신고
  async reportPost(basePostDto: BasePostDto, sessionUser: IUser, reportDto: ReportDto): Promise<IReportedPostResponse> {
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

  // 한 게시물에 달린 댓글과 답글 수 구하기
  async getNumberOfCommentsAndReplies(postId: number): Promise<number> {
    const numberOfComments = (await this.commentsDAO.countAllCommentsByPostId(postId)) || 0;
    const numberOfReplies = (await this.repliesDAO.countAllrepliesByPostId(postId)) || 0;

    const total = numberOfComments + numberOfReplies;
    return total;
  }
}
