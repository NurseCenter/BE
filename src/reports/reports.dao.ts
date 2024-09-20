import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ReportPostsEntity } from './entities/report-posts.entity';
import { ReportCommentsEntity } from './entities/report-comments.entity';
import { EReportStatus } from './enum';

@Injectable()
export class ReportsDAO {
  constructor(
    @InjectRepository(ReportPostsEntity)
    private readonly reportPostsRepository: Repository<ReportPostsEntity>,
    @InjectRepository(ReportCommentsEntity)
    private readonly reportCommentsRepository: Repository<ReportCommentsEntity>,
  ) {}

  // 게시물 신고 엔티티 생성
  async createPostReport(data: Partial<ReportPostsEntity>) {
    const reportedPost = this.reportPostsRepository.create(data);
    return reportedPost;
  }

  // 댓글 신고 엔티티 생성
  async createCommentReport(data: Partial<ReportCommentsEntity>) {
    const reportedComment = this.reportCommentsRepository.create(data);
    return reportedComment;
  }

  // 신고된 특정 게시물 조회
  async findReportByPostIdAndUserId(postId: number, userId: number) {
    return this.reportPostsRepository.findOne({
      where: { postId, userId },
    });
  }

  // 신고된 게시물 전체 조회
  async findAllReportedPosts(): Promise<any[]> {
    return await this.reportPostsRepository
      .createQueryBuilder('reportPost')
      .leftJoinAndSelect('reportPost.posts', 'post')
      .leftJoinAndSelect('post.user', 'user')
      .select([
        'reportPost.reportPostId AS reportId', // 신고된 게시물 ID (신고 테이블에서의 ID)
        'post.postId AS postId', // 게시물 ID (게시물 테이블에서의 ID)
        'post.title AS postTitle', // 게시물 제목
        'user.nickname AS postAuthor', // 게시물 작성자
        'reportPost.createdAt AS reportDate', // 신고일자
        'reportPost.reportingUser AS reporter', // 신고자
        'reportPost.reportedReason AS reportReason', // 신고 사유
        'reportPost.status AS status', // 처리 상태
      ])
      .getRawMany();
  }

  // 신고된 특정 게시물 조회
  async findReportedPost(postId: number): Promise<any> {
    return await this.reportPostsRepository
      .createQueryBuilder('reportPost')
      .leftJoinAndSelect('reportPost.posts', 'post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.postId = :postId', { postId })
      .select([
        'user.nickname AS postAuthor', // 게시물 작성자
        'post.createdAt AS postDate', // 게시물 작성일자
        'post.boardType AS postCategory', // 게시물 카테고리
        'post.postId As postId', // 게시물 ID (게시물 테이블에서의 ID)
        'post.title AS postTitle', // 게시물 제목
        'reportPost.reportingUser AS reporter', // 신고자
        'reportPost.createdAt AS reportDate', // 신고날짜
        'reportPost.reportPostId AS reportId', // 신고된 게시물 ID (신고 테이블에서의 ID) (렌더링 X)
        'reportPost.reportedReason AS reportReason', // 신고 사유
      ])
      .getRawOne();
  }

  // 신고된 특정 게시물 삭제
  async removeReportedPost(postId: number): Promise<DeleteResult> {
    return await this.reportPostsRepository.softDelete({ postId });
  }

  // 신고된 댓글 전체 조회
  async findAllReportedComments(): Promise<any[]> {
    return await this.reportCommentsRepository
      .createQueryBuilder('reportComment')
      .leftJoinAndSelect('reportComment.comments', 'comment')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('comment.user', 'user')
      .select([
        'reportComment.reportCommentId AS reportId', // 신고된 댓글 ID (신고 테이블에서의 ID) (렌더링 X)
        'comment.commentId AS commentId', // 댓글 ID (댓글 테이블에서의 ID) (렌더링 X)
        'post.title AS postTitle', // 게시물 제목 (렌더링 X)
        'comment.content AS commentContent', // 댓글 내용
        'user.nickname AS commentAuthor', // 댓글 작성자
        'reportComment.reportingUser AS reporter', // 신고자
        'reportComment.createdAt AS reportDate', // 신고일자
        'reportComment.reportedReason AS reportReason', // 신고사유
        'reportComment.status AS status', // 처리 상태
      ])
      .getRawMany();
  }

  // 신고된 특정 댓글 조회
  async findReportedComment(commentId: number): Promise<any> {
    return await this.reportCommentsRepository
      .createQueryBuilder('reportComment')
      .leftJoinAndSelect('reportComment.comments', 'comment')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.commentId = :commentId', { commentId })
      .select([
        'user.nickname AS commentAuthor', // 댓글 작성자
        'comment.createdAt AS commentDate', // 댓글 작성일자
        'post.boardType AS postCategory', // 게시물 카테고리
        'post.title AS postTitle', // 게시물 제목
        'comment.content AS commentContent', // 댓글 내용
        'reportComment.reportingUser AS reporter', // 신고자
        'reportComment.reportedAt AS reportDate', // 신고날짜
        'reportComment.reportedReason AS reportReason', // 신고사유
      ])
      .getRawOne();
  }

  // 신고된 특정 댓글 삭제
  async removeReportedComment(commentId: number): Promise<void> {
    await this.reportCommentsRepository.delete({ commentId });
  }

  // 신고된 게시물 상태 업데이트
  async updateReportedPostStatus(reportId: number, status: EReportStatus): Promise<void> {
    await this.reportPostsRepository.update(reportId, { status });
  }

  // 신고된 댓글 상태 업데이트
  async updateReportedCommentStatus(reportId: number, status: EReportStatus): Promise<void> {
    await this.reportCommentsRepository.update(reportId, { status });
  }

  // 신고된 게시물 저장
  async saveReportPost(reportPost: ReportPostsEntity): Promise<ReportPostsEntity> {
    return await this.reportPostsRepository.save(reportPost);
  }

  // 신고된 댓글 저장
  async saveReportComment(reportComment: ReportCommentsEntity): Promise<ReportCommentsEntity> {
    return await this.reportCommentsRepository.save(reportComment);
  }
}
