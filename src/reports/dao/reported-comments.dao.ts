import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ReportCommentsEntity } from '../entities/report-comments.entity';
import { EReportStatus } from '../enum';
import { IPaginatedResponse } from 'src/common/interfaces';

@Injectable()
export class ReportedCommentsDAO {
  constructor(
    @InjectRepository(ReportCommentsEntity)
    private readonly reportCommentsRepository: Repository<ReportCommentsEntity>,
  ) {}

  // 신고된 댓글 테이블의 모든 댓글 내역 조회
  async findReportedCommentsWithPagination(skip: number, take: number): Promise<[ReportCommentsEntity[], number]> {
    const [comments, count] = await this.reportCommentsRepository
      .createQueryBuilder('comment')
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return [comments, count];
  }

  // 댓글 신고 엔티티 생성
  async createCommentReport(data: Partial<ReportCommentsEntity>) {
    const reportedComment = this.reportCommentsRepository.create(data);
    return reportedComment;
  }

  // 신고된 댓글 테이블 고유 ID로 신고된 특정 댓글 내역 조회
  async findReportedCommentByReportId(reportCommentId: number) {
    return this.reportCommentsRepository.findOne({
      where: { reportCommentId },
    });
  }

  // 신고된 댓글 테이블 고유 ID와 댓글 ID로 신고된 특정 댓글 내역 조회
  async findReportedCommentByReportIdAndCommentId(reportId: number, commentId: number) {
    return this.reportCommentsRepository.findOne({
      where: { reportCommentId: reportId, commentId },
    });
  }

  // 댓글 ID와 회원 ID로 신고된 특정 댓글 조회
  async findReportedCommentByCommentIdAndUserId(commentId: number, userId: number) {
    return this.reportCommentsRepository.findOne({
      where: { commentId, userId },
    });
  }

  // 이미 신고된 댓글 유무 파악
  async existsReportedComment(commentId: number, userId: number): Promise<boolean> {
    const count = await this.reportCommentsRepository.count({
      where: { commentId, userId },
    });
    return count > 0 ? true : false;
  }

  // 신고된 댓글 전체 조회
  async findAllReportedComments(page: number = 1, limit: number = 10): Promise<IPaginatedResponse<any>> {
    const skip = (page - 1) * limit;
    const [comments, total] = await this.reportCommentsRepository
      .createQueryBuilder('reportComment')
      .leftJoinAndSelect('reportComment.comments', 'comment')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('comment.user', 'user')
      .select([
        'reportComment.reportCommentId AS reportId', // 신고된 댓글 ID (신고 테이블에서의 ID)
        'comment.commentId AS commentId', // 댓글 ID (댓글 테이블에서의 ID)
        'post.title AS postTitle', // 게시물 제목
        'post.boardType AS postCategory', // 게시판 카테고리
        'comment.content AS commentContent', // 댓글 내용
        'user.nickname AS commentAuthor', // 댓글 작성자
        'reportComment.reportingUser AS reporter', // 신고자
        'reportComment.createdAt AS reportDate', // 신고일자
        'reportComment.reportedReason AS reportReason', // 신고사유
        'reportComment.status AS status', // 처리 상태
      ])
      .where('comment.deletedAt IS NULL')
      .skip(skip)
      .take(limit)
      .getRawMany();

    return {
      items: comments,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
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
  async removeReportedComment(commentId: number): Promise<DeleteResult> {
    return await this.reportCommentsRepository.softDelete({ commentId });
  }

  // 신고된 댓글 상태 업데이트
  async updateReportedCommentStatus(reportId: number, status: EReportStatus): Promise<void> {
    await this.reportCommentsRepository.update({ reportCommentId: reportId }, { status });
  }

  // 신고된 댓글 저장
  async saveReportComment(reportComment: ReportCommentsEntity): Promise<ReportCommentsEntity> {
    return await this.reportCommentsRepository.save(reportComment);
  }
}
