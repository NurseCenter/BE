import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ReportPostsEntity } from '../entities/report-posts.entity';
import { EReportStatus } from '../enum';
import { IPaginatedResponse } from 'src/common/interfaces';
import { UsersDAO } from 'src/users/users.dao';
import { IFormattedReportedPostResponse } from '../interfaces/admin';

@Injectable()
export class ReportedPostsDAO {
  constructor(
    @InjectRepository(ReportPostsEntity)
    private readonly reportPostsRepository: Repository<ReportPostsEntity>,
    private readonly usersDAO: UsersDAO,
  ) {}

  // 게시물 신고 엔티티 생성
  async createPostReport(data: Partial<ReportPostsEntity>) {
    const reportedPost = this.reportPostsRepository.create(data);
    return reportedPost;
  }

  // 신고된 게시물 테이블 고유 ID로 신고된 특정 게시물 내역 조회
  async findReportedPostByReportId(reportPostId: number): Promise<ReportPostsEntity | null> {
    return this.reportPostsRepository.findOne({
      where: { reportPostId },
    });
  }

  // 게시물 ID로 신고된 원 게시물 조회
  async findReportedPostByPostId(reportPostId: number): Promise<ReportPostsEntity | null> {
    return this.reportPostsRepository.findOne({
      where: { reportPostId },
    });
  }

  // 신고 테이블 ID와 게시물 ID로 특정 게시물 신고 내역 조회
  async findReportedPostByReportIdAndPostId(reportId: number, postId: number): Promise<ReportPostsEntity | null> {
    return await this.reportPostsRepository.findOne({ where: { reportPostId: reportId, postId } });
  }

  // 신고 테이블 ID와 게시물 ID로 신고된 특정 게시물 내역 조회 (formatted 된 상태)
  async findFormattedReportedPostByReportIdAndPostId(
    reportId: number,
    postId: number,
  ): Promise<IFormattedReportedPostResponse> {
    const reportedPost = await this.reportPostsRepository.findOne({
      where: {
        reportPostId: reportId,
        postId,
      },
      relations: ['posts', 'posts.user'],
    });

    const reporterId = reportedPost.userId; // 신고자 회원 ID
    const reporterNickname = await this.usersDAO.findUserNicknameByUserId(reporterId);

    const formattedPost = {
      postAuthor: reportedPost.posts.user.nickname, // 작성자
      postDate: reportedPost.posts.createdAt, // 작성일자 (원 게시물)
      postCategory: reportedPost.posts.boardType, // 카테고리
      postId: reportedPost.posts.postId, // 원 게시물 ID
      postTitle: reportedPost.posts.title, // 게시물 제목
      reporter: reporterNickname, // 신고자 닉네임
      reportDate: reportedPost.createdAt, // 신고날짜
      reportId: reportedPost.reportPostId, // 신고 테이블에서의 고유 ID
      reportedReason: reportedPost.reportedReason, // 신고 사우
      otherReportedReason: reportedPost.otherReportedReason, // 기타 신고 사유
    };

    return formattedPost;
  }

  // 게시물 ID와 회원 ID로 신고된 특정 게시물 조회
  async findReportedPostByPostIdAndUserId(postId: number, userId: number): Promise<ReportPostsEntity | null> {
    return this.reportPostsRepository.findOne({
      where: { postId, userId },
    });
  }

  // 이미 신고된 게시글 유무 파악
  async existsReportedPost(postId: number, userId: number): Promise<boolean> {
    const count = await this.reportPostsRepository.count({
      where: { postId, userId },
    });

    return count > 0 ? true : false;
  }

  // 신고된 모든 게시물 조회
  async findAllReportedPosts(page: number, limit: number): Promise<IPaginatedResponse<any>> {
    const skip = (page - 1) * limit;

    const [items, total] = await this.reportPostsRepository.findAndCount({
      skip,
      take: limit,
      relations: ['posts', 'posts.user'],
      where: {
        posts: {
          deletedAt: null,
        },
      },
      order: {
        createdAt: 'DESC', // 기본: 신고일자 기준 내림차순
      },
    });

    const formattedItems = items.map((reportPost) => ({
      reportId: reportPost.reportPostId, // 신고된 게시물 ID (신고 테이블에서의 ID)
      postId: reportPost.posts.postId, // 게시물 ID (게시물 테이블에서의 ID)
      postCategory: reportPost.posts.boardType, // 게시물 카테고리
      postTitle: reportPost.posts.title, // 게시물 제목
      postAuthor: reportPost.posts.user.nickname, // 게시물 작성자
      reportDate: reportPost.createdAt, // 신고일자
      reporter: reportPost.reportingUser, // 신고자
      reportReason: reportPost.reportedReason, // 신고 사유
      otherReportedReason: reportPost.otherReportedReason, // 기타 신고 사유
      status: reportPost.status, // 처리 상태
    }));

    return {
      items: formattedItems,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // 신고된 특정 게시물 삭제
  async removeReportedPost(postId: number): Promise<DeleteResult> {
    return await this.reportPostsRepository.softDelete({ postId });
  }

  // 신고된 게시물 내역 처리상태 업데이트
  async updateReportedPostStatus(reportId: number, postId: number, status: EReportStatus): Promise<void> {
    await this.reportPostsRepository.update({ reportPostId: reportId, postId }, { status });
  }

  // 신고된 게시물 저장
  async saveReportPost(reportPost: ReportPostsEntity): Promise<ReportPostsEntity> {
    return await this.reportPostsRepository.save(reportPost);
  }
}
