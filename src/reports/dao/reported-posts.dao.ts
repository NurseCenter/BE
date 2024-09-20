import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ReportPostsEntity } from '../entities/report-posts.entity';
import { EReportStatus } from '../enum';
import { IPaginatedResponse } from 'src/common/interfaces';

@Injectable()
export class ReportedPostsDAO {
  constructor(
    @InjectRepository(ReportPostsEntity)
    private readonly reportPostsRepository: Repository<ReportPostsEntity>,
  ) {}

  // 게시물 신고 엔티티 생성
  async createPostReport(data: Partial<ReportPostsEntity>) {
    const reportedPost = this.reportPostsRepository.create(data);
    return reportedPost;
  }

  // 신고된 게시물 테이블 고유 ID로 신고된 특정 게시물 조회
  async findReportedPostByReportId(reportPostId: number) {
    return this.reportPostsRepository.findOne({
      where: { reportPostId },
    });
  }

  // 게시물 ID로 신고된 특정 게시물 조회
  async findReportedPostByPostId(postId: number) {
    return this.reportPostsRepository.findOne({
      where: { postId },
    });
  }

  // 게시물 ID와 회원 ID로 신고된 특정 게시물 조회
  async findReportedPostByPostIdAndUserId(postId: number, userId: number) {
    return this.reportPostsRepository.findOne({
      where: { postId, userId },
    });
  }

  // 신고된 게시물 전체 조회
  async findAllReportedPosts(page: number, limit: number): Promise<IPaginatedResponse<any>> {
    const skip = (page - 1) * limit;
    const [posts, total] = await this.reportPostsRepository
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
      .where('post.deletedAt IS NULL')
      .take(limit)
      .skip(skip)
      .getRawMany();

    return {
      items: posts,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
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

  // 신고된 게시물 상태 업데이트
  async updateReportedPostStatus(reportId: number, status: EReportStatus): Promise<void> {
    await this.reportPostsRepository.update(reportId, { status });
  }

  // 신고된 게시물 저장
  async saveReportPost(reportPost: ReportPostsEntity): Promise<ReportPostsEntity> {
    return await this.reportPostsRepository.save(reportPost);
  }
}
