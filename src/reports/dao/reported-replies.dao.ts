import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ReportRepliesEntity } from '../entities/report-replies.entity';
import { IPaginatedResponse } from 'src/common/interfaces';
import { EReportStatus } from '../enum';

@Injectable()
export class ReportedRepliesDAO {
  constructor(
    @InjectRepository(ReportRepliesEntity)
    private readonly reportRepliesRepository: Repository<ReportRepliesEntity>,
  ) {}

  // 신고된 답글 테이블의 모든 답글 내역 조회
  async findReportedRepliesWithPagination(skip: number, take: number): Promise<[ReportRepliesEntity[], number]> {
    const [replies, count] = await this.reportRepliesRepository
      .createQueryBuilder('reply')
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return [replies, count];
  }

  // 답글 신고 엔티티 생성
  async createReplyReport(data: Partial<ReportRepliesEntity>) {
    const reportedReply = this.reportRepliesRepository.create(data);
    return reportedReply;
  }

  // 신고된 답글 테이블 고유 ID로 신고된 특정 답글 조회
  async findReportedReplyByReportId(reportReplyId: number) {
    return this.reportRepliesRepository.findOne({
      where: { reportReplyId },
    });
  }

  // 신고된 답글 테이블 고유 ID와 답글 ID로 신고된 특정 답글 내역 조회
  async findReportedReplyByReportIdAndReplyId(reportId: number, replyId: number) {
    return this.reportRepliesRepository.findOne({
      where: { reportReplyId: reportId, replyId },
    });
  }

  // 답글 ID와 회원 ID로 신고된 특정 답글 조회
  async findReportedReplyByReplyIdAndUserId(replyId: number, userId: number) {
    return this.reportRepliesRepository.findOne({
      where: { replyId, userId },
    });
  }

  // 이미 신고된 답글 유무 파악
  async existsReportedReply(replyId: number, userId: number): Promise<boolean> {
    const count = await this.reportRepliesRepository.count({
      where: { replyId, userId },
    });
    return count > 0;
  }

  // 신고된 답글 전체 조회
  async findAllReportedReplies(page: number = 1, limit: number = 10): Promise<IPaginatedResponse<any>> {
    const skip = (page - 1) * limit;
    const [replies, total] = await this.reportRepliesRepository
      .createQueryBuilder('reportReply')
      .leftJoinAndSelect('reportReply.replies', 'reply')
      .leftJoinAndSelect('reply.comment', 'comment')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('reply.user', 'user')
      .select([
        'reportReply.reportReplyId AS reportId', // 신고된 답글 ID (신고 테이블에서의 ID)
        'reply.replyId AS replyId', // 답글 ID (답글 테이블에서의 ID)
        'post.title AS postTitle', // 게시물 제목
        'post.postId AS postId', // 게시물 ID
        'comment.commentId AS commentID', // 부모 댓글 ID
        'reply.content AS replyContent', // 답글 내용
        'user.nickname AS replyAuthor', // 답글 작성자
        'reportReply.reportingUser AS reporter', // 신고자
        'reportReply.createdAt AS reportDate', // 신고일자
        'reportReply.reportedReason AS reportReason', // 신고사유
        'reportReply.status AS status', // 처리 상태
      ])
      .where('reply.deletedAt IS NULL')
      .skip(skip)
      .take(limit)
      .getRawMany();

    return {
      items: replies,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // 신고된 특정 답글 조회
  async findReportedReply(replyId: number): Promise<any> {
    return await this.reportRepliesRepository
      .createQueryBuilder('reportReply')
      .leftJoinAndSelect('reportReply.replies', 'reply')
      .leftJoinAndSelect('reply.comment', 'comment')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('reply.user', 'user')
      .where('reply.replyId = :replyId', { replyId })
      .select([
        'user.nickname AS replyAuthor', // 답글 작성자
        'reply.createdAt AS replyDate', // 답글 작성일자
        'post.boardType AS postCategory', // 게시물 카테고리
        'post.title AS postTitle', // 게시물 제목
        'reply.content AS replyContent', // 답글 내용
        'reportReply.reportingUser AS reporter', // 신고자
        'reportReply.reportedAt AS reportDate', // 신고날짜
        'reportReply.reportedReason AS reportReason', // 신고사유
      ])
      .getRawOne();
  }

  // 신고된 특정 답글 삭제
  async removeReportedReply(replyId: number): Promise<DeleteResult> {
    return await this.reportRepliesRepository.softDelete({ replyId });
  }

  // 신고된 답글 상태 업데이트
  async updateReportedReplyStatus(reportId: number, status: EReportStatus): Promise<void> {
    await this.reportRepliesRepository.update({ reportReplyId: reportId }, { status });
  }

  // 신고된 답글 저장
  async saveReportReply(reportReply: ReportRepliesEntity): Promise<ReportRepliesEntity> {
    return await this.reportRepliesRepository.save(reportReply);
  }
}
