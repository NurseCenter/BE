import { Injectable, NotFoundException } from '@nestjs/common';
import { EReportStatus } from './enum';
import { IPaginatedResponse } from 'src/common/interfaces';
import { ReportedCommentsDAO, ReportedPostsDAO, ReportedRepliesDAO } from './dao';
import { ECommentType } from 'src/users/enums';
import { UsersDAO } from 'src/users/users.dao';
import { CommentsDAO } from 'src/comments/comments.dao';
import { RepliesDAO } from 'src/replies/replies.dao';
import { EBoardType } from 'src/posts/enum/board-type.enum';
import { PostsDAO } from 'src/posts/posts.dao';
import { IUpdateStatusResponse } from './interfaces/admin/update-status-response.interface';
import { IFormattedReportedCommentResponse } from './interfaces/admin/comments/formatted-reported-comment-detail-response.interface';
import { IFormattedReportedPostResponse, ICombinedReportResultResponse } from './interfaces/admin';
import { PostsService } from 'src/posts/posts.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly reportedCommentsDAO: ReportedCommentsDAO,
    private readonly reportedPostsDAO: ReportedPostsDAO,
    private readonly reportedRepliesDAO: ReportedRepliesDAO,
    private readonly usersDAO: UsersDAO,
    private readonly commentsDAO: CommentsDAO,
    private readonly repliesDAO: RepliesDAO,
    private readonly postsDAO: PostsDAO,
    private readonly postsService: PostsService,
  ) {}

  // 신고된 게시물 전체 조회
  async getAllReportedPosts(page: number, limit: number): Promise<IPaginatedResponse<any>> {
    const reportedPostsResponse = await this.reportedPostsDAO.findAllReportedPosts(page, limit);

    // 각 신고된 게시물에 댓글 및 답글 수 추가
    const reportedPostsWithCounts = await Promise.all(
      reportedPostsResponse.items.map(async (post) => {
        const totalCommentsAndReplies = await this.postsService.getNumberOfCommentsAndReplies(post.postId);
        return {
          ...post,
          numberOfCommentsAndReplies: totalCommentsAndReplies, // 댓글 및 답글 수 추가
        };
      }),
    );

    return {
      items: reportedPostsWithCounts,
      totalItems: reportedPostsResponse.totalItems,
      totalPages: reportedPostsResponse.totalPages,
      currentPage: reportedPostsResponse.currentPage,
    };
  }

  // 신고된 특정 게시물 조회
  async getReportedPost(reportId: number, postId: number): Promise<IFormattedReportedPostResponse> {
    const post = await this.reportedPostsDAO.findFormattedReportedPostByReportIdAndPostId(reportId, postId);
    if (!post) {
      throw new NotFoundException('해당 게시물이 존재하지 않습니다.');
    }
    return post;
  }

  // 신고된 게시물 상태 업데이트 및 저장
  async updatePostStatus(reportId: number, postId: number, status: EReportStatus): Promise<IUpdateStatusResponse> {
    await this.reportedPostsDAO.updateReportedPostStatus(reportId, postId, status);
    const reportPost = await this.reportedPostsDAO.findReportedPostByReportIdAndPostId(reportId, postId);
    if (reportPost) {
      await this.reportedPostsDAO.saveReportPost(reportPost);
    } else {
      throw new NotFoundException('해당 게시물 신고 내역을 찾을 수 없습니다.');
    }
    return { message: 'updated', reportId, postId, status };
  }

  // 신고된 모든 댓글 내역 조회
  async getAllReportedCommentsAndReplies(
    page: number,
    limit: number,
  ): Promise<IPaginatedResponse<ICombinedReportResultResponse>> {
    const skip = (page - 1) * limit;

    // 신고된 댓글과 답글 조회
    const [reportedComments] = await this.reportedCommentsDAO.findReportedCommentsWithPagination(0, 0);
    const [reportedReplies] = await this.reportedRepliesDAO.findReportedRepliesWithPagination(0, 0);

    const combinedResults: ICombinedReportResultResponse[] = [];

    // 댓글 결과 조합
    for (const comment of reportedComments) {
      const reporter = await this.usersDAO.findUserByUserId(comment.userId);
      const reporterNickname = reporter.nickname;
      const reportedUser = await this.usersDAO.findUserByUserId(comment.reportedUserId);
      const reportedUserNickname = reportedUser.nickname;
      const content = await this.commentsDAO.findCommentContentByCommentId(comment.commentId);

      combinedResults.push({
        type: ECommentType.COMMENT,
        reportId: comment.reportCommentId, // 신고된 댓글 테이블에서의 고유 ID
        commentId: comment.commentId, // 댓글 ID
        commentContent: content, // 댓글 내용
        commentAuthor: reportedUserNickname, // 댓글 작성자 (닉네임)
        reportDate: comment.createdAt, // 신고일자
        reporter: reporterNickname, // 신고자 (닉네임)
        reportReason: comment.reportedReason, // 신고 사유
        otherReportedReason: comment.otherReportedReason || null, // 기타 신고사유
        status: comment.status, // 신고처리 상태
      });
    }

    // 답글 결과 조합
    for (const reply of reportedReplies) {
      const reporter = await this.usersDAO.findUserByUserId(reply.userId);
      const reporterNickname = reporter.nickname;
      const reportedUser = await this.usersDAO.findUserByUserId(reply.reportedUserId);
      const reportedUserNickname = reportedUser.nickname;
      const content = await this.repliesDAO.findReplyContentByReplyId(reply.replyId);

      combinedResults.push({
        type: ECommentType.REPLY,
        reportId: reply.reportReplyId, // 신고된 답글 테이블에서의 고유 ID
        commentId: reply.replyId, // 답글 ID
        commentContent: content, // 답글 내용
        commentAuthor: reportedUserNickname, // 답글 작성자 (닉네임)
        reportDate: reply.createdAt, // 신고일자
        reporter: reporterNickname, // 신고자 (닉네임)
        reportReason: reply.reportedReason, // 신고 사유
        otherReportedReason: reply.otherReportedReason || null, // 기타 신고사유
        status: reply.status, // 신고처리 상태
      });
    }

    // 최신순 정렬 (신고일자 기준)
    combinedResults.sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());

    // 전체 결과에 대해 페이지네이션 적용
    const paginatedResults = combinedResults.slice(skip, skip + limit);

    return {
      items: paginatedResults,
      totalItems: combinedResults.length,
      totalPages: Math.ceil(combinedResults.length / limit),
      currentPage: page,
    };
  }

  // 신고된 특정 댓글 조회
  async getReportedComment(
    reportId: number,
    type: ECommentType,
    commentId: number,
  ): Promise<IFormattedReportedCommentResponse> {
    let reportedComment;

    // 댓글인 경우
    if (type === ECommentType.COMMENT) {
      reportedComment = await this.reportedCommentsDAO.findReportedCommentByReportIdAndCommentId(reportId, commentId);
    } else {
      // 답글인 경우
      reportedComment = await this.reportedRepliesDAO.findReportedReplyByReportIdAndReplyId(reportId, commentId);
    }

    if (!reportedComment) {
      throw new NotFoundException('해당 댓글이 존재하지 않습니다.');
    }

    // 신고자 정보 및 댓글/답글 내용 조회
    const reporter = await this.usersDAO.findUserByUserId(reportedComment.userId);
    const reporterNickname = reporter.nickname;
    const reportedReason = reportedComment.reportedReason;
    const otherReportedReason = reportedComment.otherReportedReason || null;

    let content: string;
    let postId: number;
    let postTitle: string;
    let commentAuthor: string;
    let commentDate: Date | null;
    let postCategory: EBoardType;

    // 댓글인 경우
    if (type === ECommentType.COMMENT) {
      const comment = await this.commentsDAO.findCommentById(reportedComment.commentId);
      content = await this.commentsDAO.findCommentContentByCommentId(reportedComment.commentId); // 댓글 내용
      commentAuthor = reporterNickname; // 댓글 작성자 (신고된 댓글의 작성자)
      commentDate = comment.createdAt; // 댓글 작성일

      const post = await this.postsDAO.findPostEntityByPostId(postId);
      postId = comment.postId; // 게시물 ID
      postTitle = post.title; // 게시글 제목
      postCategory = post.boardType; // 게시판 카테고리
    } else {
      // 답글인 경우
      const reply = await this.repliesDAO.findReplyById(reportedComment.replyId);
      content = await this.repliesDAO.findReplyContentByReplyId(reportedComment.replyId); // 답글 내용
      commentAuthor = reporterNickname; // 답글 작성자 (신고된 답글의 작성자)
      commentDate = reply.createdAt; // 답글 작성일

      const comment = await this.commentsDAO.findCommentById(commentId);
      postId = comment.postId; // 게시물 ID

      const post = await this.postsDAO.findPostEntityByPostId(postId);
      postTitle = post.title; // 게시글 제목
      postCategory = post.boardType; // 게시판 카테고리
    }

    return {
      commentAuthor, // 댓글 작성자 닉네임
      commentDate, // 댓글 작성일
      postCategory, // 게시판 카테고리
      postId, // 게시물 ID
      postTitle, // 게시글 제목
      commentContent: content, // 댓글 또는 답글 내용
      reporter: reporterNickname, // 신고자 닉네임
      reportDate: reportedComment.createdAt, // 신고일자
      reportedReason, // 신고사유
      otherReportedReason, // 기타 신고사유
    };
  }

  // 신고된 댓글 상태 업데이트 및 저장
  async updateCommentStatus(
    reportId: number,
    type: ECommentType,
    status: EReportStatus,
  ): Promise<IUpdateStatusResponse> {
    let reportedComment;
    let replyId: number;
    let commentId: number;

    switch (type) {
      case ECommentType.COMMENT:
        reportedComment = await this.reportedCommentsDAO.findReportedCommentByReportId(reportId);
        if (!reportedComment) {
          throw new NotFoundException('해당 댓글이 존재하지 않습니다.');
        }
        await this.reportedCommentsDAO.updateReportedCommentStatus(reportId, status);
        reportId = reportedComment.reportCommentId;
        commentId = reportedComment.commentId;
        break;
      case ECommentType.REPLY:
        reportedComment = await this.reportedRepliesDAO.findReportedReplyByReportId(reportId);
        if (!reportedComment) {
          throw new NotFoundException('해당 댓글이 존재하지 않습니다.');
        }
        await this.reportedRepliesDAO.updateReportedReplyStatus(reportId, status);
        reportId = reportedComment.reportReplyId;
        replyId = reportedComment.replyId;
        break;
    }

    return type === ECommentType.COMMENT
      ? { message: 'updated', reportId, commentId, status }
      : { message: 'updated', reportId, replyId, status };
  }
}
