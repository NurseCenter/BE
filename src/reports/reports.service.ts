import { Injectable, NotFoundException } from '@nestjs/common';
import { ReportPostsEntity } from './entities/report-posts.entity';
import { ReportCommentsEntity } from './entities/report-comments.entity';
import { EReportStatus } from './enum';
import { IPaginatedResponse } from 'src/common/interfaces';
import { PostsDAO } from 'src/posts/posts.dao';
import { ReportedCommentsDAO, ReportedPostsDAO } from './dao';
import { CommentsDAO } from 'src/comments/comments.dao';

@Injectable()
export class ReportsService {
  constructor(
    private readonly reportedCommentsDAO: ReportedCommentsDAO,
    private readonly reportedPostsDAO: ReportedPostsDAO,
    private readonly postsDAO: PostsDAO,
    private readonly commentsDAO: CommentsDAO,
  ) {}

  // 신고된 게시물 전체 조회
  async getAllReportedPosts(page: number, limit: number): Promise<IPaginatedResponse<any>> {
    const reportedPosts = await this.reportedPostsDAO.findAllReportedPosts(page, limit);
    return reportedPosts;
  }

  // 신고된 특정 게시물 조회
  async getReportedPost(postId: number): Promise<ReportPostsEntity> {
    const post = await this.reportedPostsDAO.findReportedPostByPostId(postId);
    if (!post) {
      throw new NotFoundException('해당 게시물이 존재하지 않습니다.');
    }
    return post;
  }

  // 신고된 특정 게시물 삭제
  async deleteReportedPost(postId: number): Promise<void> {
    const post = await this.getReportedPost(postId);
    if (!post) {
      throw new NotFoundException('해당 게시물이 존재하지 않습니다.');
    }
    const result1 = await this.reportedPostsDAO.removeReportedPost(postId);
    if (result1.affected === 0) {
      throw new NotFoundException('Reported_Posts 테이블에서 삭제 중 오류가 발생하였습니다.');
    }
    const result2 = await this.postsDAO.deletePost(postId);
    if (result2.affected === 0) {
      throw new NotFoundException('Posts 테이블에서 삭제 중 오류가 발생하였습니다.');
    }
  }

  // 신고된 댓글 전체 조회
  async getAllReportedComments(page: number, limit: number): Promise<IPaginatedResponse<any>> {
    return this.reportedCommentsDAO.findAllReportedComments(page, limit);
  }

  // 신고된 특정 댓글 조회
  async getReportedComment(commentId: number): Promise<ReportCommentsEntity> {
    const comment = await this.reportedCommentsDAO.findReportedCommentByCommentId(commentId);
    if (!comment) {
      throw new NotFoundException('해당 댓글이 존재하지 않습니다.');
    }
    return comment;
  }

  // 신고된 특정 댓글 삭제
  async deleteReportedComment(commentId: number): Promise<void> {
    const comment = await this.getReportedComment(commentId);
    if (!comment) {
      throw new NotFoundException(`댓글 ID ${commentId}에 해당하는 댓글이 존재하지 않습니다.`);
    }
    const result1 = await this.reportedCommentsDAO.removeReportedComment(commentId);
    if (result1.affected === 0) {
      throw new NotFoundException('Reported_Comments 테이블에서 삭제 중 오류가 발생하였습니다.');
    }
    const result2 = await this.commentsDAO.deleteComment(commentId);
    if (result2.affected === 0) {
      throw new NotFoundException('Comments 테이블에서 삭제 중 오류가 발생하였습니다.');
    }
    await this.reportedCommentsDAO.removeReportedComment(commentId);
  }

  // 신고된 게시물 상태 업데이트 및 저장
  async updatePostStatus(reportId: number, status: EReportStatus): Promise<void> {
    await this.reportedPostsDAO.updateReportedPostStatus(reportId, status);
    const reportPost = await this.reportedPostsDAO.findReportedPostByReportId(reportId);
    if (reportPost) {
      await this.reportedPostsDAO.saveReportPost(reportPost);
    }
  }

  // 신고된 댓글 상태 업데이트 및 저장
  async updateCommentStatus(reportId: number, status: EReportStatus): Promise<void> {
    await this.reportedCommentsDAO.updateReportedCommentStatus(reportId, status);
    const reportComment = await this.reportedCommentsDAO.findReportedCommentByReportId(reportId);
    if (reportComment) {
      await this.reportedCommentsDAO.saveReportComment(reportComment);
    }
  }
}
