import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportPostsEntity } from './entities/report-posts.entity';
import { ReportCommentsEntity } from './entities/report-comments.entity';
import { ReportsDAO } from './reports.dao';
import { EReportStatus } from './enum';
import { IPaginatedResponse } from 'src/common/interfaces';
import { PostsDAO } from 'src/posts/posts.dao';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportPostsEntity)
    private readonly reportPostsRepository: Repository<ReportPostsEntity>,
    @InjectRepository(ReportCommentsEntity)
    private readonly reportCommentsRepository: Repository<ReportCommentsEntity>,
    private readonly reportsDAO: ReportsDAO,
    private readonly postsDAO: PostsDAO,
  ) {}

  // 신고된 게시물 전체 조회
  async getAllReportedPosts(page: number, limit: number = 10): Promise<IPaginatedResponse<ReportPostsEntity>> {
    const [posts, total] = await this.reportPostsRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      items: posts,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // 신고된 특정 게시물 조회
  async getReportedPost(postId: number): Promise<ReportPostsEntity> {
    const post = await this.reportPostsRepository.findOne({ where: { postId } });
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
    const result1 = await this.reportsDAO.removeReportedPost(postId);
    if (result1.affected === 0) {
      throw new NotFoundException('Reported_Posts 게시판에서 삭제 중 오류가 발생하였습니다.');
    }
    const result2 = await this.postsDAO.deletePost(postId);
    if (result2.affected === 0) {
      throw new NotFoundException('Posts 게시판에서 삭제 중 오류가 발생하였습니다.');
    }
  }

  // 신고된 댓글 전체 조회
  async getAllReportedComments(page: number, limit: number = 10): Promise<IPaginatedResponse<ReportCommentsEntity>> {
    const [comments, total] = await this.reportCommentsRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      items: comments,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // 신고된 특정 댓글 조회
  async getReportedComment(commentId: number): Promise<ReportCommentsEntity> {
    const comment = await this.reportCommentsRepository.findOne({ where: { commentId } });
    if (!comment) {
      throw new NotFoundException('해당 댓글이 존재하지 않습니다.');
    }
    return comment;
  }

  // 신고된 특정 댓글 삭제
  async deleteReportedComment(commentId: number): Promise<void> {
    const comment = await this.getReportedComment(commentId);
    if (!comment) {
      throw new NotFoundException('해당 댓글이 존재하지 않습니다.');
    }
    await this.reportsDAO.removeReportedComment(commentId);
  }

  // 신고된 게시물 상태 업데이트 및 저장
  async updatePostStatus(reportId: number, status: EReportStatus): Promise<void> {
    await this.reportsDAO.updateReportedPostStatus(reportId, status);
    const reportPost = await this.reportPostsRepository.findOne({ where: { reportPostId: reportId } });
    if (reportPost) {
      await this.reportsDAO.saveReportPost(reportPost);
    }
  }

  // 신고된 댓글 상태 업데이트 및 저장
  async updateCommentStatus(reportId: number, status: EReportStatus): Promise<void> {
    await this.reportsDAO.updateReportedCommentStatus(reportId, status);
    const reportComment = await this.reportCommentsRepository.findOne({ where: { reportCommentId: reportId } });
    if (reportComment) {
      await this.reportsDAO.saveReportComment(reportComment);
    }
  }
}
