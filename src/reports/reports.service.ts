import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportPostsEntity } from './entities/report-posts.entity';
import { ReportCommentsEntity } from './entities/report-comments.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportPostsEntity)
    private readonly reportPostsRepository: Repository<ReportPostsEntity>,

    @InjectRepository(ReportCommentsEntity)
    private readonly reportCommentsRepository: Repository<ReportCommentsEntity>,
  ) {}

  // 신고된 게시물 전체 조회
  async getAllReportedPosts(): Promise<ReportPostsEntity[]> {
    return await this.reportPostsRepository.find();
  }

  // 신고된 특정 게시물 조회
  async getReportedPost(postId: number): Promise<ReportPostsEntity> {
    const post = await this.reportPostsRepository.findOne({ where: { postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  // 신고된 특정 게시물 삭제
  async deleteReportedPost(postId: number): Promise<void> {
    const result = await this.reportPostsRepository.delete({ postId });
    if (result.affected === 0) {
      throw new NotFoundException('Post not found');
    }
  }

  // 신고된 댓글 전체 조회
  async getAllReportedComments(): Promise<ReportCommentsEntity[]> {
    return await this.reportCommentsRepository.find();
  }

  // 신고된 특정 댓글 조회
  async getReportedComment(commentId: number): Promise<ReportCommentsEntity> {
    const comment = await this.reportCommentsRepository.findOne({ where: { commentId } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  // 신고된 특정 댓글 삭제
  async deleteReportedComment(commentId: number): Promise<void> {
    const result = await this.reportCommentsRepository.delete({ commentId });
    if (result.affected === 0) {
      throw new NotFoundException('Comment not found');
    }
  }
}