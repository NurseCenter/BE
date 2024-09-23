import { Injectable, NotFoundException } from '@nestjs/common';
import { ReportCommentsEntity } from './entities/report-comments.entity';
import { EReportStatus } from './enum';
import { IPaginatedResponse } from 'src/common/interfaces';
import { ReportedCommentsDAO, ReportedPostsDAO } from './dao';

@Injectable()
export class ReportsService {
  constructor(
    private readonly reportedCommentsDAO: ReportedCommentsDAO,
    private readonly reportedPostsDAO: ReportedPostsDAO,
  ) {}

  // 신고된 게시물 전체 조회
  async getAllReportedPosts(page: number, limit: number): Promise<IPaginatedResponse<any>> {
    const reportedPosts = await this.reportedPostsDAO.findAllReportedPosts(page, limit);
    return reportedPosts;
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
  async updatePostStatus(reportId: number, postId: number, status: EReportStatus) {
    await this.reportedPostsDAO.updateReportedPostStatus(reportId, postId, status);
    const reportPost = await this.reportedPostsDAO.findReportedPostByReportIdAndPostId(reportId, postId);
    if (reportPost) {
      await this.reportedPostsDAO.saveReportPost(reportPost);
    } else {
      throw new NotFoundException('해당 게시물 신고 내역을 찾을 수 없습니다.');
    }
    return { message: 'updated', reportId, postId, status };
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

  // 신고된 댓글 상태 업데이트 및 저장
  async updateCommentStatus(reportId: number, status: EReportStatus): Promise<void> {
    await this.reportedCommentsDAO.updateReportedCommentStatus(reportId, status);
    const reportComment = await this.reportedCommentsDAO.findReportedCommentByReportId(reportId);
    if (reportComment) {
      await this.reportedCommentsDAO.saveReportComment(reportComment);
    }
  }
}
